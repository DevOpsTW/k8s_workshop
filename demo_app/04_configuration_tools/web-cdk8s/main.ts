import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';

import { WebService } from './lib/web-service';

export class MyChart extends Chart {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new WebService(this, 'development', {
      replicas: 1,
      config: `DEBUG=True
SECRET_KEY=b'zkwDBJ&^4kSm_eUJ'
MONGODB_HOST='mongodb://mongo:27017/blog?replicaSet=rs0'
BLOG_TITLE='K8s Summit Blog'
BLOG_BANNER_TITLE='Kubernetes 實戰工作坊'
BLOG_BANNER_SUBTITLE='帶你從無到有打造 Kubernetes 的環境'
BLOG_BANNER_COLOR='bg-dark'`
    })
  }
}

const app = new App();
new MyChart(app, 'flask-app');
app.synth();
