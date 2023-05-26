from dapr.conf import settings

def get_address():
        host = settings.DAPR_RUNTIME_HOST
        if host is None:
            host = "localhost"
        port = settings.DAPR_GRPC_PORT
        if port is None:
            port = "4001"
        return {'host': host, 'port': port}
