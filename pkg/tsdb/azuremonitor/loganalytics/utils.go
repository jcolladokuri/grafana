package loganalytics

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func AddCustomDataLink(frame data.Frame, dataLink data.DataLink) data.Frame {
	for i := range frame.Fields {
		if frame.Fields[i].Config == nil {
			frame.Fields[i].Config = &data.FieldConfig{}
		}

		frame.Fields[i].Config.Links = append(frame.Fields[i].Config.Links, dataLink)
	}
	return frame
}

func AddConfigLinks(frame data.Frame, dl string, title *string) data.Frame {
	linkTitle := "View query in Azure Portal"
	if title != nil {
		linkTitle = *title
	}

	deepLink := data.DataLink{
		Title:       linkTitle,
		TargetBlank: true,
		URL:         dl,
	}

	frame = AddCustomDataLink(frame, deepLink)

	return frame
}

// Check whether a query should be handled as basic logs query
// 2. resource selected is a workspace
// 3. query is not an alerts query
// 4. number of selected resources is exactly one
func MeetsBasicLogsCriteria(resources []string, fromAlert bool) (bool, error) {
	if fromAlert {
		return false, fmt.Errorf("basic Logs queries cannot be used for alerts")

	}
	if len(resources) != 1 {
		return false, fmt.Errorf("basic logs queries cannot be run against multiple resources")
	}

	if !strings.Contains(strings.ToLower(resources[0]), "microsoft.operationalinsights/workspaces") {
		return false, fmt.Errorf("basic Logs queries may only be run against Log Analytics workspaces")
	}

	return true, nil
}
