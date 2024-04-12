import { AzureMonitorQuery, ResultFormat } from '../../types';

export function setKustoQuery(query: AzureMonitorQuery, kustoQuery: string): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      query: kustoQuery,
    },
  };
}

export function setFormatAs(query: AzureMonitorQuery, formatAs: ResultFormat): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      resultFormat: formatAs,
    },
  };
}

export function setDashboardTime(query: AzureMonitorQuery, dashboardTime: boolean): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      dashboardTime,
    },
  };
}

export function setLogsQueryType(query: AzureMonitorQuery, basicLogsQuery: boolean): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      basicLogsQuery,
      basicLogsQueryCostAcknowledged: false
    }
  }
}

export function setLogsQueryAcknowledgement(query: AzureMonitorQuery, basicLogsQueryCostAcknowledged: boolean): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      basicLogsQueryCostAcknowledged
    }
  }
}

export function setTimeColumn(query: AzureMonitorQuery, timeColumn: string): AzureMonitorQuery {
  return {
    ...query,
    azureLogAnalytics: {
      ...query.azureLogAnalytics,
      timeColumn,
    },
  };
}
