import React from 'react';
import { Link } from 'react-router'
import * as styles from './styles.module.scss';


export const PageHeader: React.StatelessComponent<{}> = () => {
    return (
      <div className={styles.Header}>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/#/">
               DiseaseXpress
              </a>
            </div>
            <ul className="nav navbar-nav">
              <li><Link to='/boxplot' >Box Plot</Link></li>
              <li><Link to='/scatterplot' >Scatter Plot</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
  
