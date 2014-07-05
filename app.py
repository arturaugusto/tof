from flask import Flask, jsonify
from flask import request
from PIL import Image
from subprocess import call
import urllib
import tesseract

app = Flask(__name__)

#sample request:
#http://0.0.0.0:5000/ocr?swt=1&img=http://bit.ly/ocrimage
@app.route('/ocr', methods = ['GET'])
def ocr():
	img_url = request.args.get('img')
	if img_url == None:
		return "No image!"
	# Default
	swt = True
	wl = "+-,.E0123456789"
	font = "eng"
	# Font name
	font_arg = request.args.get('font')
	if (font_arg != None) and (font_arg == "eng" or font_arg == "letsgodigital"):
		font = font_arg
	# Whitelist
	wl_arg = request.args.get('wl')
	if wl_arg != None:
		wl = wl_arg
	try:
		mImgFile = "tmp.png"
		urllib.urlretrieve(img_url, mImgFile)
		api = tesseract.TessBaseAPI()
		api.Init(".",str(font),tesseract.OEM_DEFAULT)
		api.SetVariable("tessedit_char_whitelist", str(wl))
		api.SetPageSegMode(tesseract.PSM_AUTO)
		# Stroke Width Transform
		swt_arg = request.args.get('swt')
		if swt_arg == "1":
			call(["DetectText","tmp.png","tmp_pp.png","1"])
			mImgFileOut = "tmp_pp.png"
		else:
			mImgFileOut = "tmp.png"
		mBuffer=open(mImgFileOut,"rb").read()
		result = tesseract.ProcessPagesBuffer(mBuffer,len(mBuffer),api)
		api.End()
		call(["rm","tmp.png","tmp_pp.png"])
	except:
		result = "Error."
		pass
	return result
if __name__ == "__main__":
	#app.debug = True
	app.run('0.0.0.0')
