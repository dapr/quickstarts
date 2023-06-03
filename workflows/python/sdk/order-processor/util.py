from dapr.conf import settings

def get_address():
        host = settings.DAPR_RUNTIME_HOST
        port = settings.DAPR_GRPC_PORT
        return {'host': host, 'port': port}
