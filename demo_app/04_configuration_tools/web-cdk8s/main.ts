import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';

import { Deployment, Service, IntOrString } from './imports/k8s';

export class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here

  }
}

const app = new App();
new MyChart(app, 'cdk8s-typescript');
app.synth();
