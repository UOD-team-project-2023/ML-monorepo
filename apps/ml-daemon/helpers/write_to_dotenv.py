import dotenv

def write_to_dotenv(new_key, new_value):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)
    dotenv.set_key(dotenv_file, new_key, new_value)