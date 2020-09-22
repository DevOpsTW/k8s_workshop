import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';

import { Deployment, Service, Ingress, IntOrString } from './imports/k8s';

export class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const label = { app: 'plain-app' };

    new Ingress(this, 'ingress', {
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  path: '/',
                  backend: {
                    serviceName: 'plain-app-service',
                    servicePort: IntOrString.fromNumber(80)
                  }
                }
              ]
            }
          }
        ]
      }
    });
        
    new Service(this, 'service', {
      spec: {
        ports: [ { protocol: 'TCP', port: 80, targetPort: IntOrString.fromNumber(80) } ],
        selector: label
      }
    });

    new Deployment(this, 'deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'plain-app',
                image: 'doody/plain_app:latest',
                imagePullPolicy: 'Always',
                ports: [ { containerPort: 80 } ]
              }
            ]
          }
        }
      }
    });
  }
}
        
const app = new App();
new MyChart(app, 'plain-app');
app.synth();
