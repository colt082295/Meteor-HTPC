//import Flickity from 'flickity-imagesloaded'; 
//var Flickity = require('flickity-imagesloaded');

Template.home.onRendered(function(event,template) {

var options = {
        // Optional parameters
        observer:true,
        observeParents:true,
        initialSlide: 0,
        direction: 'horizontal',
        loop: false,
        preloadImages: true,
        updateOnImagesReady: true,
        

        // If we need pagination
        //pagination: '.swiper-pagination',

        // Navigation arrows
        nextButton: '.car-nav .next',
        prevButton: '.car-nav .prev',

        keyboardControl: true,
        mousewheelControl: true,
        mousewheelForceToAxis: true,
        mousewheelSensitivity: .8,


        freeMode: true,
        //freeModeSticky: true,
        freeModeMomentumBounce: false,

        //preloadImages: false,
        //lazyLoading: true,
        //watchSlidesVisibility: true,

        //lazyLoadingInPrevNext: true,

        // And if we need scrollbar
        //scrollbar: '.swiper-scrollbar',
        scrollbarDraggable: true,
        scrollbarHide: false,
        //scrollbarSnapOnRelease: true,
        slidesPerView: 10,
        slidesPerGroup: 10,
        spaceBetween: 20,

        breakpoints: {
            // when window width is <= 320px
            320: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetweenSlides: 10
            },
            640: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetweenSlides: 10
            },
            1024: {
                slidesPerView: 5,
                slidesPerGroup: 5,
                spaceBetweenSlides: 15
            },
            1200: {
                slidesPerView: 8,
                slidesPerGroup: 8,
                spaceBetweenSlides: 20
            },
            1440: {
                slidesPerView: 10,
                slidesPerGroup: 10,
                spaceBetweenSlides: 25
            }
        }

    }

var swiper1 = new Swiper('#continue-swiper', options);

if(Template.parentData(0).movies) {
var swiper2 = new Swiper('#movie-swiper', options);
}

//if(Template.parentData(0).shows) {
var swiper3 = new Swiper('#show-swiper', options);
console.log("swiper3");
console.log(swiper3);
//}
console.log(Template.parentData(0).shows);    
    
    
    var initializing = true;

        var handle = Tv.find().observe({
          added: function (item) {
            if (!initializing) {
                console.log("Item added to tv:");
                //console.log(item);
                console.log(swiper3);
                if (swiper3){
                    /*
                    var modalSwiper = $('#show-swiper')[0].swiper;
                    var modalSwiper1 = $('#show-swiper')[0];
                    console.log(modalSwiper);
                    console.log(modalSwiper1);
                    swiper3.update(true);
                    */
                } else {
                    swiper3 = new Swiper('#show-swiper', options);
                    console.log("Inited the tv swiper:");
                }
                
                
                //var swiper = $( "#show-swiper" );
                //var swipe1 = swiper[0];
                //var s = swipe1.swiper;
                //if(swipe1) {
                //console.log(swipe1);
                //console.log(s);
                //swiper3.update();
                //}
                //mySwiper.reInit()
                //swiper.context.update();
                //mySwiper.destroy();
            }
          }
        });
        
        initializing = false;







});