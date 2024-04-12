import React, { useCallback, useEffect, useState } from 'react';

import { SelectableValue } from '@grafana/data';
import { InlineField, RadioButtonGroup, Select } from '@grafana/ui';

import { AzureQueryEditorFieldProps } from '../../types';

import { setLogsQueryType } from './setQueryValue';

export function LogsManagement({ query, onQueryChange: onChange }: AzureQueryEditorFieldProps) {
  return (
    <>
      <InlineField
        label="Logs"
        tooltip={
          <span>
            Specifies the type of logs query to run
          </span>
        }
      >
        <RadioButtonGroup
          options={[{ label: 'Analytics', value: false },
          { label: 'Basic', value: true }]}
          value={query.azureLogAnalytics?.basicLogsQuery ?? false}
          size={'md'}
          onChange={(val) => onChange(setLogsQueryType(query, val))}
        />
      </InlineField>
    </>
  );
}
