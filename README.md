# Kubernetes Workshop

## 前言

## 環境準備

* 註冊帳號
  * [AWS](https://aws.amazon.com/tw/free/)
  * [Azure](https://azure.microsoft.com/zh-tw/free/search/)
  * [GCP](https://cloud.google.com/gcp)
* 安裝 cli
  * eksctl for EKS [文件](https://eksctl.io/introduction/#installation)
  * azure cli for AKS [文件](https://docs.microsoft.com/zh-tw/cli/azure/?view=azure-cli-latest)
  * gcp cli for GKE [文件](https://cloud.google.com/sdk/docs/install)
  * kubectl for kubernetes
    * [文件](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
    * 透過 cli 安裝, 擇一
      ```shell
	  $ az aks install-cli
	  $ gcloud components install kubectl
	  ```

## 建立 Kubernetes

> 以下環境已 Linux 為例, 網頁為中文(繁體)語系操作

本節將會在各家建立兩個節點的 kubernetes 服務, 操作前都先需要取得權限, 請依下面的指令指示操作.

另外提醒本工作坊以展示 kubernetes 為主, 所以權限控管設定是不正常的, 日後要使用請依照官方文件為主

以下建置指令可以並行, 只是使用 `kubectl` 之前要確認一下連接的 kubernstes 是那一組.

* kubectl context 切換操作 (以下輸出內容經簡化,方便看)
  ```shell
  $ kubectl config get-contexts
  CURRENT   NAME       CLUSTER    AUTHINFO        NAMESPACE
            aks-2020   aks-2020   aks-2020
  *         gke-2020   gke-2020   gke-2020
            eks-2020   eks-2020   eks-2020
  $ kubectl config use-context <your_context_name>
  ```

### AWS - EKS

```shell
# 取得操作權限
# 在 AWS 控制台 IAM 建立使用者設定 `AdministratorAccess`與金鑰, 並設定置環境變數(請把下面換成自己的)
$ export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
$ export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
$ export AWS_DEFAULT_REGION=us-west-2

$ eksctl create cluster \
    --name eks-2020 \
    --managed \
    --node-type t3.medium
# 等待建置完成, 自動更新 kubeconfig
$ kubectl get nodes
NAME                                           STATUS   ROLES    AGE     VERSION
ip-192-168-31-192.us-west-2.compute.internal   Ready    <none>   3m33s   v1.17.9-eks-4c6976
ip-192-168-89-55.us-west-2.compute.internal    Ready    <none>   3m52s   v1.17.9-eks-4c6976
```

### Azure - AKS

```shell
# 取得操作權限
$ az login

$ az group create --name k8s-summit --location eastasia
$ az aks create \
    --name aks-2020 \
    --resource-group k8s-summit \
    --node-count 2
# 等待建置完成 ~

# 設定 kubeconfig
$ az aks get-credentials --resource-group k8s-summit --name aks-2020
$ kubectl get nodes
NAME                                STATUS   ROLES   AGE   VERSION
aks-nodepool1-30396539-vmss000000   Ready    agent   21m   v1.17.9
aks-nodepool1-30396539-vmss000001   Ready    agent   20m   v1.17.9
```

### GCP - GKE

```shell
# 取得操作權限: 登入帳號, 設定隨意專案, 預設區域 26 (asia-east1-b)
$ gcloud init

$ gcloud container clusters create gke-2020 --num-nodes=2
# 等待建置完成 ~

# 設定 kubeconfig
$ gcloud container clusters get-credentials gke-2020
$ kubectl get nodes
NAME                                      STATUS   ROLES    AGE     VERSION
gke-gke-2020-default-pool-ed94fc94-l7cs   Ready    <none>   6m59s   v1.15.12-gke.2
gke-gke-2020-default-pool-ed94fc94-rfkz   Ready    <none>   6m59s   v1.15.12-gke.2
```

## 測試 kubernetes (擇一)

### azure-vote (從 yaml 建立 App)

```shell
$ git clone https://github.com/Azure-Samples/azure-voting-app-redis.git
$ cd azure-voting-app-redis
$ kubectl apply -f azure-vote-all-in-one-redis.yaml
$ kubectl get svc --watch
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
azure-vote-back    ClusterIP      10.35.245.162   <none>           6379/TCP       12m
azure-vote-front   LoadBalancer   10.35.244.235   35.185.154.244   80:32221/TCP   12m
# 等待 azure-vote-front EXTERNAL-IP 出現後就可以從網頁玩玩看

# 移除
$ kubectl delete -f azure-vote-all-in-one-redis.yaml
```

### hello-service (從 cli 建立 App)

```shell
# 安裝
$ kubectl create deployment hello-server --image=gcr.io/google-samples/hello-app:1.0
$ kubectl expose deployment hello-server --type LoadBalancer \
  --port 80 --target-port 8080
$ kubectl get svc --watch
  NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
hello-server       LoadBalancer   10.35.249.140   34.80.217.67     80:31200/TCP   4m41s
# 等待 hello-server EXTERNAL-IP 出現後就可以從網頁玩玩看

# 清理
$ kubectl delete deployment hello-server
$ kubectl delete service hello-server
```

## 工作坊內容

## 移除 Kubernetes

<B>注意!!! 請確實刪掉不然會收到帳單</B>

```
# 刪除 EKS
$ eksctl delete cluster --name eks-2020
[✔]  all cluster resources were deleted

# 刪除 AKS
$ az aks delete --name aks-2020 --resource-group k8s-summit
Are you sure you want to perform this operation? (y/n): y

# 刪除 GKE
$ gcloud container clusters delete gke-2020
Deleted [https://container.googleapis.com/v1/projects/<project>/zones/<zone-name>/clusters/gke-2020].
```
