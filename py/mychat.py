import glob
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import sys
from urllib.parse import parse_qs, urlparse
from wx import get_wx_info,batch_decrypt,merge_real_time_db
import jieba

class ApiHTTPRequestHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/api/wxinfo':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            wxinfo=get_wx_info()
            response = {'data': {'wxinfo':wxinfo}}
            self.wfile.write(json.dumps(response).encode())
            return
        if self.path.find('/api/syncrealtimedb')!=-1:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            parsed_path = urlparse(self.path)
            query_params = parse_qs(parsed_path.query)
            response = {'msg':"success"}
            try:
                filtered_files = glob.glob(query_params['db_path'][0]+'/**/MSG*.db', recursive=True)
                db_name=filtered_files[-1].replace(query_params['db_path'][0]+'\Msg','').replace("MSG", "de_MSG")
                out_path=query_params['out_path'][0]+db_name
                merge_real_time_db(query_params['key'][0],out_path,{"db_path":filtered_files[-1]})
                # merge_real_time_db(query_params['key'][0],query_params['out_path'][0]+'/de_MicroMsg.db',{"db_path":query_params['db_path'][0]+'/Msg/MicroMsg.db'})
                response['out_path']=out_path
                response['db_path']=filtered_files[-1]
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write('')
                return
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {'error': 'Not Found'}
            self.wfile.write(json.dumps(response).encode())
    def do_POST(self):
        if self.path == '/api/asyncwxdb':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            response={}
            try:
                params = json.loads(post_data.decode('utf-8'))
                if params['wxPath']:
                    outPath=decryptionWxDb(params['key'],params['wxPath'])
                    response={'data':{'outDbPath':outPath}}
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(e)
                return
            self.wfile.write(json.dumps(response).encode())
        # if self.path == '/api/parseextra':
        #     self.send_response(200)
        #     self.send_header('Content-type', 'application/json')
        #     self.send_header('Access-Control-Allow-Origin', '*')
        #     self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        #     self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        #     self.end_headers()
        #     content_length = int(self.headers.get('Content-Length', 0))
        #     post_data = self.rfile.read(content_length)
        #     result=""
        #     try:
        #         # data = json.loads(post_data.decode('utf-8'))
        #         # print(data)
        #         result=decompress_CompressContent(post_data)
        #     except json.JSONDecodeError:
        #         self.send_response(400)
        #         self.end_headers()
        #         self.wfile.write(b'Invalid JSON')
        #         return
        #     self.wfile.write(json.dumps({"data":result}).encode())
        if self.path == '/api/wordcut':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            result=""
            try:
                params = json.loads(post_data.decode('utf-8'))
                result=jieba.cut(params['content'])
                def is_not_special_char(s):
                    if s.isalpha() or '\u4e00' <= s <= '\u9fff':
                        return True
                result=list(filter(is_not_special_char,result))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write('')
                return
            self.wfile.write(json.dumps({"data":result}).encode())
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run(server_class=HTTPServer, handler_class=ApiHTTPRequestHandler, port=4556):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd server on port {port}...')
    httpd.serve_forever()

def decryptionWxDb(key,dbPath):
    outPath=os.getcwd()+'/wxDb'
    if not os.path.exists(outPath):
        os.makedirs(outPath)
    if not os.path.exists(outPath+'/Multi'):
        os.makedirs(outPath+'/Multi')
    batch_decrypt(key, dbPath+'/Msg',outPath )
    batch_decrypt(key,dbPath+'/Msg/Multi',  outPath+'/Multi' )
    return outPath

if __name__ == '__main__':
    run()
