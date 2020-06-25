import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { createHistory } from 'history';
import { Router, Route, IndexRoute, useRouterHistory, Redirect } from 'react-router'
import App from './App';
import DashboardPage from 'pages/dashboard/DashboadPage';
import BoxPlotView from 'pages/resultView/BoxPlotView';
import ScatterPlotView from 'pages/resultView/ScatterPlotView';
import ExtendedRoutingStore from './lib/ExtendedRouterStore';

import './globalStyles/prefixed-global.scss';
import { syncHistoryWithStore } from 'mobx-react-router';
import { GlobalStores } from 'shared/components/global/GlobalStores';
import PageNotFound from 'shared/components/pageNotFound/PageNotFound';
import { getApiUrl } from 'api/urls';


const routingStore = new ExtendedRoutingStore();

const globalStores = new GlobalStores();

const history = useRouterHistory(createHistory)({
  basename: '',
});


const syncedHistory = syncHistoryWithStore(history, routingStore);

const stores = {
  routing: routingStore,
  globalStores
};

window.globalStores = stores;
window.routingStore = routingStore;

const makeRoutes = routing => {
  return (
    <Route path="/" component={App}>
      <IndexRoute
        component={DashboardPage}
      />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/boxplot" component={BoxPlotView} />
      <Route path="/scatterplot" component={ScatterPlotView} />

      <Route path='/api' component={() => {
        window.location.href = getApiUrl();
        return null;
      }} />
      <Route
        path="*"
        component={() => <PageNotFound />}
      />
    </Route>
  );
};

ReactDOM.render(
  <Provider {...stores}>
    <Router history={syncedHistory} routes={makeRoutes()}></Router>
  </Provider>,
  document.getElementById("reactRoot"));