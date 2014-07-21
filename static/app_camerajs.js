/*
 * ASCII Camera
 * http://idevelop.github.com/ascii-camera/
 *
 * Copyright 2013, Andrei Gheorghe (http://github.com/idevelop)
 * Released under the MIT license
 */

(function() {
	if( ( $(window).width() < 580 ) & (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
		$("#webcam").css({"width": "60%", "height": "60%"})

	}	



	$(document).ready(function(){

		$('#webcam').Jcrop({
			onChange: function (c) {
				$('#x1').val(c.x);
				$('#y1').val(c.y);
				$('#x2').val(c.x2);
				$('#y2').val(c.y2);
			}
		});
		
		$('#threshold').noUiSlider({
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
		});

		$('#dilate').noUiSlider({
			start: 1,
			step: 1,
			range: {
				'min': 1,
				'max': 10
			},
			serialization: {
				lower: [
					$.Link({
						target: $("#dilate-label")
					})
				],
				format: {
					decimals: 0
				}			
			}
		});


		$("#invert").bootstrapSwitch({
			labelText: "Invert"
		});

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
			$( "#wl_text" ).val("+-.0123456789E");
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
			var canvas = document.getElementById('filter');
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
				url: "ocr",
				contentType: false,
				processData: false,
				data: data,
				contentType: "application/json; charset=utf-8",
			}).done(function(o) {
				$("#ocr_out").val(o)
			});
		});
	});


	/*	
	var capturing = false;
	
	camera.init({
		width: 480,
		height: 360,
		fps: 5,
		mirror: false,
		//targetCanvas: document.getElementById('webcam'), // default: null 
		targetCanvas: null,
		onFrame: function(img) {
			// In canvas
			var c = document.getElementById("webcam");
			var ctx = c.getContext("2d");
			// Out canvas
			var out = document.getElementById("filter");
			var ctxOut = out.getContext("2d");
			// Clear first
			// Store the current transformation matrix
			ctxOut.save();
			// Use the identity matrix while clearing the canvas
			ctxOut.setTransform(1, 0, 0, 1, 0, 0);
			ctxOut.clearRect(0, 0, out.width, out.height);
			// Restore the transform
			ctxOut.restore();			

			ctx.drawImage(img,0,0);
			// Selection coords
			var x = $('#x1').val()
			var y = $('#y1').val()
			var width = $('#x2').val() - x
			var height = $('#y2').val() - y
			//var imageData = ctx.getImageData(0,0,c.width,c.height);
			var imageData = ctx.getImageData(x,y,width,height);
			// Grayscale
			var filtered = ImageFilters.GrayScale(imageData);
			// Threshold
			// Only apply if not using swt
			var threshold = $('#threshold').val();
			var filtered = ImageFilters.Binarize(filtered, threshold/100);
			//var filtered = ImageFilters.Mosaic(filtered, parseInt(dilate));
			// Invert
			if($("#invert").is(":checked")){
				var filtered = ImageFilters.Invert(filtered);
			}
			// Dilate
			var dilate = $('#dilate').val();
			if(parseInt(dilate) > 1){
				console.log("aqui");
			}
			ctxOut.putImageData(filtered,0,0);

var dilate = new FILTER.MorphologicalFilter( ).dilate([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1

]);  // dilate with a 3x3 diagonal structure element

// if you want to make this filter work in another thread in parallel through a worker, do:
dilate.worker( );

// if you want to stop and dispose the worker for this filter, do:
dilate.worker( false );
dilate.apply( ctxOut ); 


		},

		onSuccess: function() {
			capturing = true;
			document.getElementById("info").style.display = "none";
		},
		onError: function(error) {
			console.log(error)
			// TODO: log error
		},
		onNotSupported: function() {
			document.getElementById("info").style.display = "none";
			document.getElementById("notSupported").style.display = "block";
		}
	});
	*/
})();