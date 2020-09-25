import { Construct, Node } from 'constructs';
import { Deployment, Service, ConfigMap } from '../imports/k8s';

export interface WebServiceOptions {
  /**
   * The Docker image to use for this service.
   * @default doody/flask_app:latest
   */
  readonly image?: string;

  /**
   * environment that deployed
   *
   * @default development
   */
  readonly env?: string;
  
  /**
   * Number of replicas.
   *
   * @default 3
   */
  readonly replicas?: number;

  /**
   * External port.
   *
   * @default 5000
   */
  readonly port?: number;

  /**
   * Internal port.
   *
   * @default 5000
   */
  readonly containerPort?: number;

  /**
   * Config
   *
   * @default defaultConfig
   */
  readonly config?: string;
}

const defaultConfig =
`DEBUG=True
SECRET_KEY=b'zkwDBJ&^4kSm_eUJ'
MONGODB_HOST='mongodb://mongo:27017/blog?replicaSet=rs0'
BLOG_TITLE='K8s Summit Blog'
BLOG_BANNER_TITLE='Kubernetes 實戰工作坊'
BLOG_BANNER_SUBTITLE='帶你從無到有打造 Kubernetes 的環境'
BLOG_BANNER_COLOR='bg-dark'`

export class WebService extends Construct {
  constructor(scope: Construct, ns: string, options: WebServiceOptions) {
    super(scope, ns);

    const port = options.port || 5000;
    const containerPort = options.containerPort || 5000;
    const label = {
      id : Node.of(this).uniqueId,
      app: 'flask-app',
      env: options.env || 'development'
    };
    const image = options.image || 'doody/flask_app:latest'
    const replicas = options.replicas ?? 3;

    new ConfigMap(this, 'configmap', {
      metadata: { name: 'flask-app-config' },
      data: {
        'app.cfg': options.config || defaultConfig,
      },
    });

    new Service(this, 'service', {
      metadata: { name: 'flask-app-service' },
      spec: {
        type: 'LoadBalancer',
        selector: label,
        ports: [
          { protocol: 'TCP', port, targetPort: port }
        ],
      },
    });

    new Deployment(this, 'deployment', {
      spec: {
        replicas,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'flask-app',
                image,
                imagePullPolicy: 'Always',
                resources: {
                  limits: { cpu: '200m' },
                  requests: { cpu: '100m' },
                },
                ports: [{ containerPort }],
                volumeMounts: [
                  {
                    name: 'flask-config',
                    mountPath: '/app/app.cfg',
                    subPath: 'app.cfg'
                  }
                ]
              }
            ],
            volumes: [
              {
                name: 'flask-config',
                configMap: { name: 'flask-app-config' }
              }
            ],
          },
        },
      },
    });
    
  }
}
