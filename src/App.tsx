import React from 'react';
import { PageHeader } from 'shared/components/pageHeader/PageHeader';
import { PageFooter } from 'shared/components/pageFooter/PageFooter';
import styles from './styles.module.scss';
import ReactGA from 'react-ga';


//TODO: create environment variable
ReactGA.initialize('UA-117358922-1');

interface IContainerProps {
  location: Location;
  children: React.ReactNode;
}

export default class App extends React.Component<IContainerProps, {}> {
  render() {
    return (
      <div className="App">
        <PageHeader/>
        <div className={styles.Container}>
          {this.props.children}
        </div>
        <PageFooter/>
      </div>
    );
  }
}
