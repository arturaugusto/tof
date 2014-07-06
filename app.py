from flask import Flask, jsonify
from flask import request
from PIL import Image
from subprocess import call
import urllib
#import tesseract
from tightocr.adapters.api_adapter import TessApi
from tightocr.adapters.lept_adapter import pix_read
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
		t = TessApi(None, str(font));
		t.set_variable('tessedit_char_whitelist', str(wl))
		# Stroke Width Transform
		swt_arg = request.args.get('swt')
		if swt_arg == "1":
			call(["DetectText","tmp.png","tmp_pp.png","1"])
			mImgFileOut = "tmp_pp.png"
		else:
			mImgFileOut = "tmp.png"
		p = pix_read(mImgFileOut)
		t.set_image_pix(p)
		t.recognize()
		result = str(t.get_utf8_text())
		#result = tesseract.ProcessPagesBuffer(p,len(p),t)
		#t.End()
		call(["rm","tmp.png","tmp_pp.png"])
	except:
		result = "Error."
		pass
	return result
if __name__ == "__main__":
	#app.debug = True
	app.run('0.0.0.0')
