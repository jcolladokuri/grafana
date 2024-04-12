import React, { useEffect, useState } from 'react';

import { PanelData, TimeRange } from '@grafana/data';
import { EditorFieldGroup, EditorRow, EditorRows } from '@grafana/experimental';
import { Alert, LinkButton, Checkbox, VerticalGroup } from '@grafana/ui';

import Datasource from '../../datasource';
import { selectors } from '../../e2e/selectors';
import { AzureMonitorErrorish, AzureMonitorOption, AzureMonitorQuery, ResultFormat, EngineSchema } from '../../types';
import FormatAsField from '../FormatAsField';
import ResourceField from '../ResourceField';
import { ResourceRow, ResourceRowGroup, ResourceRowType } from '../ResourcePicker/types';
import { parseResourceDetails } from '../ResourcePicker/utils';

import AdvancedResourcePicker from './AdvancedResourcePicker';
import QueryField from './QueryField';
import { TimeManagement } from './TimeManagement';
import { setFormatAs, setLogsQueryAcknowledgement, setLogsQueryType } from './setQueryValue';
import useMigrations from './useMigrations';
import { LogsManagement } from './LogsManagement';

interface LogsQueryEditorProps {
  query: AzureMonitorQuery;
  datasource: Datasource;
  subscriptionId?: string;
  onChange: (newQuery: AzureMonitorQuery) => void;
  variableOptionGroup: { label: string; options: AzureMonitorOption[] };
  setError: (source: string, error: AzureMonitorErrorish | undefined) => void;
  hideFormatAs?: boolean;
  timeRange?: TimeRange;
  data?: PanelData;
}

const LogsQueryEditor = ({
  query,
  datasource,
  subscriptionId,
  variableOptionGroup,
  onChange,
  setError,
  hideFormatAs,
  timeRange,
  data,
}: LogsQueryEditorProps) => {
  const currentPath = window.location.pathname;
  console.log(`The current URL path is ${currentPath}`);
  const migrationError = useMigrations(datasource, query, onChange);
  const [showLogsManagement, setShowLogsManagement] = useState<boolean>(false);
  const [hasBasicLogs, setHasBasicLogs] = useState<boolean>(false);
  const disableRow = (row: ResourceRow, selectedRows: ResourceRowGroup) => {
    if (selectedRows.length === 0) {
      // Only if there is some resource(s) selected we should disable rows
      return false;
    }
    const rowResourceNS = parseResourceDetails(row.uri, row.location).metricNamespace?.toLowerCase();
    const selectedRowSampleNs = parseResourceDetails(
      selectedRows[0].uri,
      selectedRows[0].location
    ).metricNamespace?.toLowerCase();
    // Only resources with the same metricNamespace can be selected
    return rowResourceNS !== selectedRowSampleNs;
  };
  const [schema, setSchema] = useState<EngineSchema | undefined>();

  useEffect(() => {
    if (query.azureLogAnalytics?.resources && query.azureLogAnalytics.resources.length) {
      datasource.azureLogAnalyticsDatasource.getKustoSchema(query.azureLogAnalytics.resources[0]).then((schema) => {
        setSchema(schema);
      });
    }
  }, [query.azureLogAnalytics?.resources, datasource.azureLogAnalyticsDatasource]);

  useEffect(() => {
    const resources = query.azureLogAnalytics?.resources ?? [];
    console.log(hasBasicLogs)
    if (resources.length && resources.length === 1 && resources[0].toLowerCase().indexOf("microsoft.operationalinsights/workspaces") > -1) {
      setShowLogsManagement(true);
    } else {
      onChange(setLogsQueryType(query, false));
      setShowLogsManagement(false);
    }
  }, [query.azureLogAnalytics?.resources, hasBasicLogs]);
  console.log("showlogsManagemetn", showLogsManagement)
  let portalLinkButton = null;
  let dataIngestedWarning = null;

  if (data?.series) {
    const querySeries = data.series.find((result) => result.refId === query.refId);
    if (querySeries) {
      if (querySeries.meta?.custom?.azurePortalLink) {
        portalLinkButton = (
          <>
            <LinkButton
              size="md"
              target="_blank"
              style={{ marginTop: '22px' }}
              href={querySeries.meta?.custom?.azurePortalLink}
            >
              View query in Azure Portal
            </LinkButton>
          </>
        );
      }

      if(querySeries.meta?.custom?.basicLogsDataVolume && query.azureLogAnalytics.basicLogsQuery) {
        console.log(querySeries.meta?.custom?.basicLogsDataVolume);
        dataIngestedWarning = (
          <>
            <p style={{color: "green"}}>{`This query is processing ${querySeries.meta?.custom?.basicLogsDataVolume} GiB when run.`}</p>
            {/* <p style={{color: "green"}}>{`This is a Basic Logs query and incurs cost per GiB scanned.`}</p> */}
          </>
        );
      }
    }
  }
  console.log(query)
  return (
    <span data-testid={selectors.components.queryEditor.logsQueryEditor.container.input}>
      <EditorRows>
        <EditorRow>
          <EditorFieldGroup>
            <ResourceField
              query={query}
              datasource={datasource}
              setHasBasicLogs={setHasBasicLogs}
              inlineField={true}
              labelWidth={10}
              subscriptionId={subscriptionId}
              variableOptionGroup={variableOptionGroup}
              onQueryChange={onChange}
              setError={setError}
              selectableEntryTypes={[
                ResourceRowType.Subscription,
                ResourceRowType.ResourceGroup,
                ResourceRowType.Resource,
                ResourceRowType.Variable,
              ]}
              resources={query.azureLogAnalytics?.resources ?? []}
              queryType="logs"
              disableRow={disableRow}
              renderAdvanced={(resources, onChange) => (
                // It's required to cast resources because the resource picker
                // specifies the type to string | AzureMonitorResource.
                // eslint-disable-next-line
                <AdvancedResourcePicker resources={resources as string[]} onChange={onChange} />
              )}
              selectionNotice={() => 'You may only choose items of the same resource type.'}
            />
            {currentPath.indexOf("/explore") !== -1 && showLogsManagement && (<LogsManagement
              query={query}
              onQueryChange={onChange}
            />)}
            <TimeManagement
              query={query}
              datasource={datasource}
              variableOptionGroup={variableOptionGroup}
              onQueryChange={onChange}
              setError={setError}
              schema={schema}
            />
          </EditorFieldGroup>
        </EditorRow>
        <QueryField
          query={query}
          datasource={datasource}
          subscriptionId={subscriptionId}
          variableOptionGroup={variableOptionGroup}
          onQueryChange={onChange}
          setError={setError}
          schema={schema}
        />
        <EditorRow>
          <VerticalGroup>
            {query.azureLogAnalytics?.basicLogsQuery && (
              <Checkbox value={query.azureLogAnalytics.basicLogsQueryCostAcknowledged} label={`I acknowledge that this query incurs cost per GiB scanned`} onChange={(e: React.FormEvent<HTMLInputElement>) => {
                onChange(setLogsQueryAcknowledgement(query, e.currentTarget.checked));
                
              }}/>
            )}
            {dataIngestedWarning}
          </VerticalGroup>
        </EditorRow>
        <EditorRow>
          <EditorFieldGroup>
            {!hideFormatAs && (
              <FormatAsField
                query={query}
                datasource={datasource}
                subscriptionId={subscriptionId}
                variableOptionGroup={variableOptionGroup}
                onQueryChange={onChange}
                setError={setError}
                inputId={'azure-monitor-logs'}
                options={[
                  { label: 'Log', value: ResultFormat.Logs },
                  { label: 'Time series', value: ResultFormat.TimeSeries },
                  { label: 'Table', value: ResultFormat.Table },
                ]}
                defaultValue={ResultFormat.Logs}
                setFormatAs={setFormatAs}
                resultFormat={query.azureLogAnalytics?.resultFormat}
              />
            )}
            {portalLinkButton}
            {migrationError && <Alert title={migrationError.title}>{migrationError.message}</Alert>}
          </EditorFieldGroup>
        </EditorRow>
      </EditorRows>
    </span>
  );
};

export default LogsQueryEditor;
