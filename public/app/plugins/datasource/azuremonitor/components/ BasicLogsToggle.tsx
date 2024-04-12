import React from 'react';

import { InlineSwitch, InlineField, TextLink, Text } from '@grafana/ui';


export interface Props {
  onBasicLogsToggleChange: (basicLogsEnabled: boolean) => void;
}

export const BasicLogsToggle = (props: Props) => {
    const {onBasicLogsToggleChange} = props

  const onChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    console.log("changing config for basic logs", event.currentTarget.checked)
    onBasicLogsToggleChange(event.currentTarget.checked)};
  const basicLogsTooltip = (
      <>
        <Text>Enabling this feature incurs Azure Monitor per-query cost on dashboard panels that use Tables configured for <TextLink href="https://learn.microsoft.com/en-us/azure/azure-monitor/logs/basic-logs-configure?tabs=portal-1" external inline>Basic Logs</TextLink></Text>
      </>
    );
  return (
    <>
    <div className="gf-form gf-form--grow">
        <InlineField label="Basic Logs" tooltip={basicLogsTooltip}>
          <InlineSwitch onChange={onChange}></InlineSwitch>
        </InlineField>
    </div>
    </>
  );
};
