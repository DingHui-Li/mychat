

import os
import subprocess

def merge_real_time_db(key, merge_path: str, db_paths: [dict] or dict, real_time_exe_path: str = None):
    """
    合并实时数据库消息,暂时只支持64位系统
    :param key:  解密密钥
    :param merge_path:  合并后的数据库路径
    :param db_paths:  [dict] or dict eg: {'wxid': 'wxid_***', 'db_type': 'MicroMsg',
                        'db_path': 'C:\**\wxid_***\Msg\MicroMsg.db', 'wxid_dir': 'C:\***\wxid_***'}
    :param real_time_exe_path:  实时数据库合并工具路径
    :return:
    """
    try:
        import platform
    except:
        raise ImportError("未找到模块 platform")
    # 判断系统位数是否为64位，如果不是则抛出异常
    if platform.architecture()[0] != '64bit':
        raise Exception("System is not 64-bit.")

    if isinstance(db_paths, dict):
        db_paths = [db_paths]

    merge_path = os.path.abspath(merge_path)  # 合并后的数据库路径，必须为绝对路径
    merge_path_base = os.path.dirname(merge_path)  # 合并后的数据库路径
    if not os.path.exists(merge_path_base):
        os.makedirs(merge_path_base)

    endbs = []
    for db_info in db_paths:
        db_path = os.path.abspath(db_info['db_path'])
        if not os.path.exists(db_path):
            # raise FileNotFoundError("数据库不存在")
            continue
        endbs.append(os.path.abspath(db_path))
    endbs = '" "'.join(list(set(endbs)))

    if not os.path.exists(real_time_exe_path if real_time_exe_path else ""):
        current_path = os.path.dirname(__file__)  # 获取当前文件夹路径
        real_time_exe_path = os.path.join(current_path, "tools", "realTime.exe")
    if not os.path.exists(real_time_exe_path):
        raise FileNotFoundError("未找到实时数据库合并工具")
    real_time_exe_path = os.path.abspath(real_time_exe_path)

    # 调用cmd命令
    cmd = f'{real_time_exe_path} "{key}" "{merge_path}" "{endbs}"'
    # os.system(cmd)
    # wx_core_loger.info(f"合并实时数据库命令：{cmd}")
    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=merge_path_base,creationflags=subprocess.CREATE_NO_WINDOW)
    out, err = p.communicate()  # 查看返回值
    if out and out.decode("utf-8").find("SUCCESS") >= 0:
        print(f"合并实时数据库成功{out}")
        return True, merge_path
    else:
        print(f"合并实时数据库失败\n{out}\n{err}")
        return False, (out, err)