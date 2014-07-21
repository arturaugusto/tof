(function() {


	window.requestAnimationFrame = ( function() {
			// Simple dsable request animaton frame...
			/*return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame || */
			return function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

					window.setTimeout( callback, 1000 / 2 );

			};

	} )();


	if( ( $(window).width() < 580 ) & (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
		$("#webcam").css({"width": "60%", "height": "60%"});

	}	


	var offset = {};
	var $F = FILTER;

	var disposeWorker = function () {
		this.worker(false);
	};

	// Filter functions
	var thresholdFilter;
	var setThresholdFilter = function(){
		thresholdFilter = new $F.ColorMatrixFilter( ).threshold( parseInt($('#threshold').val()) );
	};

	// To create matrix
	var im = function(n){
		var level = 1;
		return Array.apply(null, new Array(Math.pow((n*2),2))).map(Number.prototype.valueOf,1);
	}
	var dilateFilter;
	var setDilateFilter = function(){
		var n = parseInt($('#dilate').val())
		var m = im(n);
		if($("#invert").is(":checked")){
			dilateFilter = new $F.MorphologicalFilter( ).opening( m );
		}else{
			dilateFilter = new $F.MorphologicalFilter( ).closing( m );
		}
	};
	$(document).ready(function(){
		$('video').Jcrop({
			setSelect: [10,10,100,100],
			minSize: [10,10],
			onChange: function (c) {
				$('#x1').val(c.x);
				$('#y1').val(c.y);
				$('#x2').val(c.x2);
				$('#y2').val(c.y2);
				offset.x1 = c.x;
				offset.y1 = c.y;
				offset.x2 = c.x2;
				offset.y2 = c.y2;				
			}
		});
		
		$('#threshold')
			.noUiSlider({
				start: 100,
				step: 1,
				range: {
					'min': 0,
					'max': 255
				},
				serialization: {
					lower: [
						$.Link({
							target: $("#threshold-label")
						})
					],
					format: {
						decimals: 0
					}			
				}
			})
			.on({
				slide: function(){
					setThresholdFilter();
				}
			});
		setThresholdFilter();
		$('#dilate')
			.noUiSlider({
				start: 1,
				step: 2,
				range: {
					'min': 1,
					'max': 9
				},
				serialization: {
					lower: [
						$.Link({
							target: $(".dilate-label")
						})
					],
					format: {
						decimals: 0
					}			
				}
			})
			.on({
				slide: function(){
					setDilateFilter();
				}
			});

		$("#invert").bootstrapSwitch({
			labelText: "Invert",
			onSwitchChange: setDilateFilter
		});

		var loggerTimeOut;
		$("#start_logging").bootstrapSwitch({
			labelText: "Logging",
			onText: "Running",
			offText: "Stoped",
			onColor: "success",
			offColor: "danger",
			onSwitchChange: function(){
				var state = $("#start_logging").is(":checked");
				if(state){
					logData();
				}else{
					clearTimeout(loggerTimeOut);
				}
			}
		});


		var logData = function(){
			OCR(function(data){
				var ta = document.getElementById("textAreaOut");
				var now = new Date();
				ta.value += data.replace(/ /g,'').replace(/(\r\n|\n|\r)/gm,"") + "\n";
				ta.scrollTop = ta.scrollHeight;
			});
			loggerTimeOut = setTimeout(function(){logData()}, 2000);
		}

		$("#swt").bootstrapSwitch({
			labelText: "swt"
		});


		$( "#wl_a_to_z" ).click(function(event){
			$( "#wl_text" ).val("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
			event.preventDefault();
		})

		$( "#wl_full" ).click(function(event){
			$( "#wl_text" ).val("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZçÇ<>!@#$%*()_+={}[]~.,?/º");
			event.preventDefault();
		})

		$( "#wl_numbers" ).click(function(event){
			$( "#wl_text" ).val("+-.,0123456789E");
			event.preventDefault();
		})

		$( "#font_7segments" ).click(function(event){
			$( "#ocr_font" ).val("7 segments");
			$( "#ocr_font" ).data({font:"letsgodigital"});
			event.preventDefault();
		})

		$( "#font_standard" ).click(function(event){
			$( "#ocr_font" ).val("Standard");
			$( "#ocr_font" ).data({font:"eng"});
			event.preventDefault();
		})

		// Starting valures
		$("#font_7segments").trigger("click")
		$("#wl_numbers").trigger("click")

		$( "#ocr" ).click(function() {
			OCR(function(outp){$("#ocr_out").val(outp.replace(/ /g,''))})
		})

		var OCR = function(cb) {
			var canvas = document.getElementById('result');
			var dataURL = canvas.toDataURL().replace('data:image/png;base64,', '');
			//~ 583536 orig
			//~ 9328 tresh filter
			//~ grayscale 69140 (fundo claro)
			//~ grayscale 214608 (fundo escuro)
			var wl = $( "#wl_text" ).val();
			var font = $( "#ocr_font" ).data("font");

			var swt = 0;
			if($("#swt").is(":checked")){
				swt = 1;
			}
			var data = JSON.stringify(
			{
				img: dataURL,
				font: font,
				wl: wl,
				swt: swt
			});
			$.ajax({
				type: "POST",
				url: "/ocr",
				contentType: false,
				processData: false,
				data: data,
				contentType: "application/json; charset=utf-8",
			}).done(cb);
		};

	});

	navigator.getUserMedia  = navigator.getUserMedia ||
														navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia ||
														navigator.msGetUserMedia;

	var video = document.querySelector('video');

	var vgaConstraints = {
		audio: false, 
		video: true
	};
	if (navigator.getUserMedia) {
			navigator.getUserMedia(vgaConstraints, 
			function(stream) {
        // Set the source of the video element with the stream from the camera
        if (video.mozSrcObject !== undefined) {
        	video.mozSrcObject = stream;
        } else {
        	video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }				
				//video.src = window.URL.createObjectURL(stream);
				video.play();
				video.addEventListener('loadeddata', function() {
					requestAnimationFrame(start);
				}, false);
				$("#info").css({"display": "none"});
			},
			function(){
				console.log("Error")
			});
	}else{
		$("#notSupported").css({"display": "block"});
	}

	

	var grc = new $F.ColorMatrixFilter( ).grayscale( );
	var invert = new $F.ColorMatrixFilter( ).invert( );

	var start = function () {
		offset.w = video.width;
		offset.h = video.height;
		try{
			var img = new $F.Image(video).clone().select(offset.x1 / offset.w, offset.y1 / offset.h, offset.x2 / offset.w, offset.y2 / offset.h);		
			//grc.apply( img );
			
			
			thresholdFilter.apply(img);
			if($("#invert").is(":checked")){
				invert.apply( img );
			}

			// Dilate
			var dilate = $('#dilate').val();
			if(parseInt(dilate) > 1){
				dilateFilter.apply( img );
			}


			// Set tmp result div, and set the id
			$("#tmp_result_div").html($(img.canvasElement).attr({"id": "tmp_result"}));
			// In canvas
			var c = document.getElementById("tmp_result");
			var ctx = c.getContext("2d");
			// Out canvas
			var out = document.getElementById("result");
			var ctxOut = out.getContext("2d");
			// Dinamic set the w and h
			// Get selection
			var x = $('#x1').val()
			var y = $('#y1').val()
			var width = $('#x2').val() - x
			var height = $('#y2').val() - y
			// Set target canvas size
			out.width = width;
			out.height = height;
			// Clear canvas first
			// Store the current transformation matrix
			ctxOut.save();
			// Use the identity matrix while clearing the canvas
			ctxOut.setTransform(1, 0, 0, 1, 0, 0);
			ctxOut.clearRect(0, 0, width, height);
			// Restore the transform
			ctxOut.restore();
			ctxOut.drawImage(c,x,y,width,height,0,0,width,height);
			requestAnimationFrame(start);
			
		} catch (e) {
			if (e.name == "NS_ERROR_NOT_AVAILABLE") {
			  // Wait a bit before trying again; you may wish to change the
			  // length of this delay.
			  setTimeout(requestAnimationFrame(start), 100);
			} else {
			  throw e;
			}
		}
	}

})();