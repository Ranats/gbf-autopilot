#!/usr/bin/env python
from configparser import ConfigParser
from controller import Window
from threading import Thread

from werkzeug.wrappers import Request, Response
from werkzeug.serving import run_simple

from jsonrpc import JSONRPCResponseManager, dispatcher

import requests
import pyautogui
import win32gui
import win32api
import win32con
import logging
import time
import os

config = ConfigParser()
config.read('config.ini', encoding='utf-8')

DEFAULT_PORT = int(config['Controller']['ListenerPort'])
COMMAND_PORT = int(config['Server']['ListenerPort'])
EXIT_KEY_CODE = int(config['Inputs']['ExitKeyCode'])

log = logging.getLogger('werkzeug')
logLevel = config['Debug']['LogLevel'].upper()
if logLevel != 'DEBUG':
    log.setLevel(getattr(logging, logLevel))

commandStarted = False
window = Window({
    'Language': config['General']['Language'].lower(),
    'MouseSpeed': float(config['Inputs']['MouseSpeed']),
    'MouseSpeedBase': float(config['Inputs']['MouseSpeedBase']),
    'MouseClickDelay': float(config['Inputs']['DelayInMsBetweenMouseDownAndUp']),
    'MouseClickRandomDelay': float(config['Inputs']['RandomDelayInMsBetweenMouseDownAndUp']),
    'MouseTween': getattr(pyautogui, config['Controller']['MouseTween'])
})

def keyPress(json):
    key = str(json['key']).lower()
    vkCode = win32api.VkKeyScan(key)
    scanCode = win32api.MapVirtualKey(vkCode, 0)
    win32api.keybd_event(vkCode, scanCode, 0, 0)
    win32api.keybd_event(vkCode, scanCode, 2, 0)
    return 'OK'

def getKeyPressed(keyCode):
    retval = win32api.GetAsyncKeyState(keyCode)
    return retval == 1

def stopCommandServer():
    global commandStarted
    print('Stopping command server...')
    try:
        requests.post('http://localhost:%d/stop' % COMMAND_PORT)
        commandStarted = False
        print('Command server stopped')
    except:
        print('Failed to stop the command server!')

def listenForEscape():
    running = True

    def task():
        if commandStarted and getKeyPressed(EXIT_KEY_CODE):
            stopCommandServer()

    def runner():
        while running:
            task()
            time.sleep(0.5)
    t = Thread(target=runner)
    t.setDaemon(True)
    t.start()

if __name__ == '__main__':
    listenForEscape()
