import React from 'react';
import styles from './index.css';

export type BasicLayoutComponent<P> = React.SFC<P>;

export interface BasicLayoutProps extends React.Props<any> {
  history?: History;
  location?: Location;
}

const BasicLayout: BasicLayoutComponent<BasicLayoutProps> = props => {
  return (
    <div className={styles.normal}>
      <h1 className={styles.title}>Edit & Copy</h1>
      {props.children}
    </div>
  );
};

export default BasicLayout;
