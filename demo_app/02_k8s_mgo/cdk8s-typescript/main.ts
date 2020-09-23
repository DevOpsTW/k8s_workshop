import { Construct } from 'constructs';
import { App, Chart, ApiObject } from 'cdk8s';
import { readFileSync } from 'fs';
import { Service, ConfigMap } from './imports/k8s';

const initScript = readFileSync(`${__dirname}/init.sh`);

export class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const label = { app: 'mongo-db' };

    new ConfigMap(this, 'mongo-config-map', {
      metadata: { name: 'mongo-init' },
      data: {
        'init.sh': initScript.toString()
      }
    });

    new Service(this, 'mongo-service', {
      metadata: {
        name: 'mongo',
        labels: label,
      },
      spec: {
        ports: [{ name: 'mongod', port: 27017 }],
        clusterIP: 'None',
        selector: label
      },
    });
    
    // This is a workaround for this [issue](https://github.com/awslabs/cdk8s/issues/140)
    new ApiObject(this, 'mongo-statefulset', {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      spec: {
        serviceName: 'mongo',
        replicas: 3,
        selector: {
          matchLabels: label
        },
        volumeClaimTemplates: [
          {
            metadata: { name: 'database' },
            spec: {
              accessModes: [ 'ReadWriteOnce' ],
              resources: {
                requests: { storage: '20Gi' }
              }
            }
          }
        ],
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'mongodb',
                image: 'mongo:4.4',
                command: [
                  'mongod',
                  '--replset',
                  'rs0',
                  '--bind_ip_all'
                ],
                ports: [ { name: 'mongod', containerPort: 27017 } ],
                volumeMounts: [
                  { name: 'database', mountPath: '/data/db' }
                ],
                livenessProbe: {
                  exec: {
                    command: [
                      '/usr/bin/mongo',
                      '--eval',
                      'db.serverStatus()',
                    ]
                  },
                  initialDelaySeconds: 10,
                  timeoutSeconds: 10,
                } 
              },
              {
                name: 'init-mongo',
                image: 'doody/mongodb-ping:4.4',
                command: [
                  'bash',
                  '/config/init.sh',
                ],
                volumeMounts: [{ name: 'config', mountPath: '/config' }]
              },
            ],
            volumes: [
              { name: 'config', configMap: { name: 'mongo-init' } }
            ],
          },
        },
      },
    });

    /*
    new StatefulSet(this, 'mongo-statefulset', {
      spec: {
        serviceName: 'mongo',
        replicas: 3,
        selector: {
          matchLabels: label
        },
        volumeClaimTemplates: [
          {
            metadata: { name: 'database' },
            spec: {
              accessModes: [ 'ReadWriteOnce' ],
              resources: {
                requests: { storage: '20Gi' }
              }
            }
          }
        ],
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'mongodb',
                image: 'mongo:4.4',
                command: [
                  'mongod',
                  '--replset',
                  'rs0',
                  '--bind_ip_all'
                ],
                ports: [ { name: 'mongod', containerPort: 27017 } ],
                volumeMounts: [
                  { name: 'database', mountPath: '/data/db' }
                ],
                livenessProbe: {
                  exec: {
                    command: [
                      '/usr/bin/mongo',
                      '--eval',
                      'db.serverStatus()',
                    ]
                  },
                  initialDelaySeconds: 10,
                  timeoutSeconds: 10,
                } 
              },
              {
                name: 'init-mongo',
                image: 'doody/mongodb-ping:4.4',
                command: [
                  'bash',
                  '/config/init.sh',
                ],
                volumeMounts: [{ name: 'config', mountPath: '/config' }]
              },
            ],
            volumes: [
              { name: 'config', configMap: { name: 'mongo-init' } }
            ],
          },
        },
      },
    });
    */
  }
}

const app = new App();
new MyChart(app, 'mongodb');
app.synth();
