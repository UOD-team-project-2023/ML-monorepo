from dotenv import dotenv_values
import time
import threading
from helpers.get_metrics import get_static_information_json, get_dynamic_information_json
from helpers.api_interface import ApiInterface
from helpers.try_int import try_int
from helpers.write_to_dotenv import write_to_dotenv
from helpers.generate_client_id import generate_client_id
from helpers.check_desktop_enviroment import check_desktop_enviroment
import schedule
import logging
import logging.config
import yaml
from PIL import Image
if check_desktop_enviroment():
    import pystray


class Probe():
    def __init__(self):
        self.schedule_thread = None
        self.schedule_thread_running = True
        self.tray = None

        with open('logging.yaml', 'r') as f:
            config = yaml.safe_load(f.read())
            logging.config.dictConfig(config)

        self.logger = logging.getLogger(__name__)

        dotenv_ingest_success = self._ingest_dotenv()
        self.api = ApiInterface(self.url, self.client_id, self.psk)
        server_registration_success = self.register_with_server()
        if not dotenv_ingest_success or not server_registration_success:
            return

        self.schedule_thread = threading.Thread(
            target=self.run_schedule, args=())
        self.schedule_thread.start()

        if check_desktop_enviroment():
            self._setup_tray_icon()

    def _setup_tray_icon(self):
        self.logger.info('Desktop enviroment detected, starting tray icon.')

        self.last_static_update_menu_item = pystray.MenuItem(
            "Last Static Update: Never", None, enabled=False)
        self.last_dynamic_update_menu_item = pystray.MenuItem(
            "Last Dynamic Update: Never", None, enabled=False)
        self.tray_thread = threading.Thread(
            target=self._run_tray_icon, args=())
        self.tray_thread.start()

    def update_tray_menu_item(self, menu_item, new_title):
        new_menu_item = pystray.MenuItem(new_title, None)
        self.tray.append(new_menu_item)

    def _run_tray_icon(self):
        self.icon = Image.open("images/systray_icon.png")
        self.hover_text = "Monitor Lizard"

        self.menu_options = (
            self.last_static_update_menu_item,
            self.last_dynamic_update_menu_item,
            pystray.MenuItem("Update Now", self.after_click),
            pystray.MenuItem("Exit", self.after_click)
        )

        self.menu = pystray.Menu(*self.menu_options)
        self.tray = pystray.Icon(
            self.hover_text, self.icon, self.hover_text, self.menu)
        self.tray.run()

    def after_click(self, icon, query):
        if str(query) == "opt1":
            print("opt1 clicked")
        elif str(query) == "opt2":
            print("opt2 clicked")
        elif str(query) == "Update Now":
            self.logger.debug('TRAY ICON: Update now clicked.')
            self.send_static_data()
            self.send_dynamic_data()
        elif str(query) == "Exit":
            self.logger.debug('TRAY ICON: Exit clicked.')
            self.shutdown()

    def _ingest_dotenv(self):
        try:
            config = dotenv_values(".env")

            #self.name = config["PROBE_NAME"]
            #self.timeout = config["PROBE_TIMEOUT"]
            self.url = config["SERVER_URL"]
            self.dynamic_data_interval = try_int(
                config["DYNAMIC_DATA_INTERVAL"])
            self.static_data_interval = try_int(config["STATIC_DATA_INTERVAL"])
            self.psk = config["PSK"]
            self.use_hostname_as_client_id = config["USE_HOSTNAME_AS_CLIENT_ID"]

            if "CLIENT_ID" in config and config["CLIENT_ID"] != "":
                self.logger.debug('Client ID found.')
                self.client_id = config["CLIENT_ID"]
            else:
                self.logger.debug('Client ID missing. Regenerating.')
                self.client_id = generate_client_id(
                    self.use_hostname_as_client_id)
                write_to_dotenv("CLIENT_ID", self.client_id)

            return True
        except:
            self.logger.critical('Error reading .env')
            print("Error reading .env")
            return False

    def shutdown(self):
        self.logger.info('Shutting down.')
        self.schedule_thread_running = False
        self.schedule_thread.join()
        self.tray.stop()
        print("Shutdown")

    def send_dynamic_data(self):
        dynamic_data = get_dynamic_information_json()
        returned_http_status, returned_json = self.api.call_api(
            "/dynamic_data", dynamic_data)
        #self.last_dynamic_update_menu_item.title = "Last Dynamic Update: " + time.strftime("%H:%M:%S", time.localtime())
        # self.tray.update_menu()
        if returned_http_status == 200:
            self.logger.debug('Dynamic data sent.')
            print("Dynamic data sent")
        else:
            self.logger.error('Dynamic data send failed.')
            print(returned_http_status, returned_json)

    def send_static_data(self):
        static_data = get_static_information_json()
        returned_http_status, returned_json = self.api.call_api(
            "/static_data", static_data)
        #self.last_static_update_menu_item.title = "Last Static Update: " + time.strftime("%H:%M:%S", time.localtime())
        # self.tray.update_menu()
        if returned_http_status == 200:
            self.logger.debug('Static data sent.')
            print("Static data sent")
        else:
            self.logger.error('Static data send failed.')
            print(returned_http_status, returned_json)

    def run_schedule(self):
        self.logger.debug('Starting schedule thread.')
        schedule.every(self.dynamic_data_interval).seconds.do(
            self.send_dynamic_data)
        schedule.every(self.static_data_interval).seconds.do(
            self.send_static_data)

        while self.schedule_thread_running:
            schedule.run_pending()
            time.sleep(1)

    def register_with_server(self):

        returned_http_status, returned_json = self.api.call_api(
            "/create_client", self.client_id)

        if returned_http_status == 200:
            self.logger.debug('Registration successful.')
            print("Registration successful")
            return True
        else:
            self.logger.critical('Registration failed.')
            print(returned_http_status, returned_json)
            return False


if __name__ == "__main__":
    probe = Probe()

    print(f"API URL: {probe.url}")
    print(f"Cient ID: {probe.client_id}")
