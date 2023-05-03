import json
import os.path


#Accepts string for file name. String for key. String for Data to be written.
def write_to_disk(file_name, data):


    JSON_data = json.dumps(data)
    
    JSON_data = str.encode(JSON_data)
    
    with open("./data/" + file_name, "wb") as binary_file:
        binary_file.write(JSON_data)

#Accepts string for file name. String for key. String for Data to be written.
def read_from_disk(file_name):

    if not os.path.isfile("./data/" + file_name):
        return None
    
    with open("./data/" + file_name, "rb") as binary_file:
        raw_JSON = binary_file.read()
        data = json.loads(raw_JSON)

    return data