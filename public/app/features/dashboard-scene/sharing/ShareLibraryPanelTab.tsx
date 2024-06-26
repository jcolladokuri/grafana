import React from 'react';

import { SceneComponentProps, SceneObjectBase, SceneObjectRef, VizPanel } from '@grafana/scenes';
import { LibraryPanel } from '@grafana/schema/dist/esm/index.gen';
import { t } from 'app/core/internationalization';
import { ShareLibraryPanel } from 'app/features/dashboard/components/ShareModal/ShareLibraryPanel';
import { shareDashboardType } from 'app/features/dashboard/components/ShareModal/utils';
import { DashboardModel, PanelModel } from 'app/features/dashboard/state';

import { DashboardGridItem } from '../scene/DashboardGridItem';
import { gridItemToPanel, transformSceneToSaveModel } from '../serialization/transformSceneToSaveModel';

import { SceneShareTabState } from './types';

export interface ShareLibraryPanelTabState extends SceneShareTabState {
  panelRef?: SceneObjectRef<VizPanel>;
}

export class ShareLibraryPanelTab extends SceneObjectBase<ShareLibraryPanelTabState> {
  public tabId = shareDashboardType.libraryPanel;
  static Component = ShareLibraryPanelTabRenderer;

  public getTabLabel() {
    return t('share-modal.tab-title.library-panel', 'Library panel');
  }
}

function ShareLibraryPanelTabRenderer({ model }: SceneComponentProps<ShareLibraryPanelTab>) {
  const { panelRef, dashboardRef, modalRef } = model.useState();

  if (!panelRef) {
    return null;
  }

  const parent = panelRef.resolve().parent;

  if (parent instanceof DashboardGridItem) {
    const dashboardScene = dashboardRef.resolve();
    const panelJson = gridItemToPanel(parent);
    const panelModel = new PanelModel(panelJson);

    const dashboardJson = transformSceneToSaveModel(dashboardScene);
    const dashboardModel = new DashboardModel(dashboardJson);

    return (
      <ShareLibraryPanel
        initialFolderUid={dashboardScene.state.meta.folderUid}
        dashboard={dashboardModel}
        panel={panelModel}
        onDismiss={() => {
          modalRef?.resolve().onDismiss();
        }}
        onCreateLibraryPanel={(libPanel: LibraryPanel) => dashboardScene.createLibraryPanel(parent, libPanel)}
      />
    );
  }

  return null;
}
