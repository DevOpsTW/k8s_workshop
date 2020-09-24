#!/usr/bin/env python
from constructs import Construct
from cdk8s import App, Chart

from imports import k8s


class MyChart(Chart):
    def __init__(self, scope: Construct, name: str):
        super().__init__(scope, name)

        label = {"app": "plain-app"}

        k8s.Service(self, 'service',
                    spec=k8s.ServiceSpec(
                      type='LoadBalancer',
                      ports=[k8s.ServicePort(protocol='TCP',port=80, target_port=k8s.IntOrString.from_number(80))],
                      selector=label))

        k8s.Deployment(self, 'deployment',
                       spec=k8s.DeploymentSpec(
                         replicas=1,
                         selector=k8s.LabelSelector(match_labels=label),
                         template=k8s.PodTemplateSpec(
                           metadata=k8s.ObjectMeta(labels=label),
                           spec=k8s.PodSpec(containers=[
                             k8s.Container(
                               name=name,
                               image='doody/plain_app:latest',
                               image_pull_policy='Always',
                               ports=[k8s.ContainerPort(container_port=80)])]))))


app = App()
MyChart(app, "plain-app")

app.synth()
