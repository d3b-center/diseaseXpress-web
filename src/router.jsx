import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import App from './App';
import DashboardPage from 'pages/dashboard/DashboadPage';
import BoxPlotView from 'pages/resultView/BoxPlotView';
import ScatterPlotView from 'pages/resultView/ScatterPlotView';
import ExtendedRoutingStore from './lib/ExtendedRouterStore';

import './globalStyles/prefixed-global.scss';
import { syncHistoryWithStore } from 'mobx-react-router';
import { GlobalStores } from 'shared/components/global/GlobalStores';


var defaultRoute = window.defaultRoute || '/dashboard';

const routingStore = new ExtendedRoutingStore();

const globalStores = new GlobalStores();

const syncedHistory = syncHistoryWithStore(hashHistory, routingStore);

const stores = {
  routing: routingStore,
  globalStores
};

window.globalStores = stores;
window.routingStore = routingStore;

ReactDOM.render(
<Provider {...stores}>
  <Router history={syncedHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage}/>
      <Route path="/boxplot" component={BoxPlotView}/>
      <Route path="/scatterplot" component={ScatterPlotView}/>
    </Route>
  </Router>
</Provider>, document.getElementById("reactRoot"));