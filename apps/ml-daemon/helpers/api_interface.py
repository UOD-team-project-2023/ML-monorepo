import json
import httpx


class ApiInterface:
    def __init__(self, api_url, client_id, psk):
        self.api_url = self._sanitize_url(api_url)
        self.headers = {
            'Authorization': psk,
            'Client-ID': client_id,
            'Content-Type': 'application/json',
        }
    
    def _sanitize_url(self, url):
        return url.strip().rstrip('/')

    def call_api(self, endpoint, data):
        try:
            response = httpx.post(self.api_url + endpoint, headers=self.headers, data=data)

        except httpx.HTTPError as exc:
            return 000, json.dumps({'error': 'HTTPError', 'message': str(exc)})
        
        try:
            response_json = response.json()
        except:
            response_json = response

        return response.status_code, response_json