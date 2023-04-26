import hashlib
import time
import random
from helpers.get_metrics import get_host_name

def generate_client_id(use_hostname_as_client_id=False):
    if use_hostname_as_client_id == "True":
        seed = get_host_name()
    else:
        seed = get_host_name() + str(time.time()) + str(random.random())

    return hashlib.sha256(str(seed).encode()).hexdigest()