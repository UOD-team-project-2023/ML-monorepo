def get_client_host_name(client):
    static_metric_length = len(client.StaticMetric)
    host_name = client.id
    if static_metric_length:
        host_name = client.StaticMetric[static_metric_length - 1].host_name
    return host_name
