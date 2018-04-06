import React, { Component } from 'react';
import { PageHeader } from 'shared/components/pageHeader/PageHeader';
import { PageFooter } from 'shared/components/pageFooter/PageFooter';
import styles from './styles.module.scss';

interface IContainerProps {
  location: Location;
  children: React.ReactNode;
}

export default class App extends Component<IContainerProps, {}> {
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
