import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import img1 from '../assets/carouselLoad/pot.jpg'
import img2 from '../assets/carouselLoad/protein.jpg'
import img3 from '../assets/carouselLoad/trimmer.jpg'
export function CarouselComponent(){
     const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 1,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    const carouselImg=[img1,img2,img3]
    const productTemplate = (carouselImg) => {
        return (
            <div className="text-center py-5 px-3">
                <div className="mb-3">
                    <img src={carouselImg} alt='resolving..' className="rounded-lg shadow-2" />
                </div>
                <div>
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <Carousel value={carouselImg} numVisible={1} numScroll={3} responsiveOptions={responsiveOptions} className="custom-carousel" circular
            autoplayInterval={3000} itemTemplate={productTemplate} />
        </div>
    )
}