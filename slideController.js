function SlideController() {
	this.panes = new Array();
	this.current = -1;
	
	// these shouldn't be here
	this.summaryPane = null;
	this.routesPane = null;
	this.schedulePane = null;
	this.lookupPane = null;
	
	this.wrapper = $("<div id='slideWrapper'></div>");
	$('#wrapper').append(this.wrapper);
	
	// maybe?
	//var self = this;
	//this.wrapper.bind('webkitTransitionEnd', function() { self.finishSlide.call(self) });
		
	this.add = function(pane,i) {
		// add to internal state
		if(i == null || i >= this.panes.length) {
			this.panes.push(pane);
		} else {
			this.panes.splice(i,1,pane);
		}
		
		// figure out which pane this is
		// THIS IS HACKY AND SHOULDN'T BE HERE
		if($('.homeWrapper',pane.domElem).size() != 0) { this.summaryPane = i == null ? this.panes.length - 1 : i; }
		else if($('#routesListWrapper',pane.domElem).size() != 0) { this.routesPane = i == null ? this.panes.length - 1 : i; }
		else if($('#scheduleWrapper',pane.domElem).size() != 0) { this.schedulePane = i == null ? this.panes.length - 1 : i; }
		else if($('.lookupPane',pane.domElem).size() != 0) { this.lookupPane = i == null ? this.panes.length - 1 : i; }
		
		// add to DOM
		if(i == null || i >= this.panes.length) { this.wrapper.append(pane.domElem); } 
		else if (i == 0) { this.wrapper.prepend(pane.domElem); }
		else { $('*:eq('+i+')',this.wrapper).before(pane.domElem); }
		
		
		// adjust styles to maintain viewport
		this.wrapper.css('width',(100 * this.panes.length) + '%');
		$('.slidePane',this.wrapper).css('width',(100 / this.panes.length) + '%');
	}
	
	this.remove = function(i) {
		// remove from internal state
		this.panes.splice(i,1);

		// remove from DOM
		$('.slidePane:eq('+i+')',this.wrapper).remove();
		
		// adjust styles
		this.wrapper.css('width',(100 * this.panes.length) + '%');
		$('.slidePane',this.wrapper).css('width',(100 / this.panes.length) + '%');
	}
	
	this.slideTo = function(i) {
		var old = this.current;
		this.current = i;
		$('.currentPane').removeClass('.currentPane');
		$(this.panes[this.current].domElem).addClass('currentPane');
	
		// adjust the height of the viewport so that you don't slide in with nothing visible
		this.wrapper.css('minHeight',window.scrollY + 417);
		
		var self = this;
		this.wrapper.css('left',(-100 * i) + '%');
		setTimeout(function() { self.finishSlide.call(self); },350);
		
		//this.wrapper.animate({'left':(-100 * i) + '%'},300, "swing", function() { self.finishSlide.call(self); });
		
		/*$('.in').removeClass('in');
		$('.out').removeClass('out');
		
		$(this.panes[this.current].domElem).addClass('in');
		if(old > 0) { $(this.panes[old].domElem).addClass('out'); $(this.panes[old].domElem).hide(); }
		$(this.panes[this.current].domElem).show();
		*/
	}
	
	this.finishSlide = function() {
		
		console.log('finishing...');
		
		for(var i = this.panes.length - 1; i > this.current; i--) { this.remove(i); }
				
		if(this.panes[this.current].onSlideIn) {
			$('#titlebar *').unbind();
			this.panes[this.current].onSlideIn();
		}
		
		this.reViewport();
		window.scrollTo(0,1);
	}
	
	this.reViewport = function() {
		this.wrapper.css('height',$('.slidePane:eq('+this.current+')',this.wrapper).outerHeight());
	}
	
	this.slideNext = function() { if(this.panes.length > this.current + 1) { this.slideTo(this.current + 1); } }
	this.slidePrev = function() { if(this.current > 0) { this.slideTo(this.current - 1); } }
	
}