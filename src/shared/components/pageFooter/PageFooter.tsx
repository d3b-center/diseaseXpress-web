import React, { StatelessComponent } from 'react';
import styles from './styles.module.scss'

export const PageFooter: StatelessComponent<{}> = () => {
    return (
        <footer>
            <div className={styles.Footer}>
                <p>© 2018 DiseaseXpress. All Rights reserved </p>
                <p>Contact information: <a href="">questions</a>.</p>
            </div>

        </footer>
    );
}