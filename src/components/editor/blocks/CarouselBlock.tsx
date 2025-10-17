import React, { useState, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload } from 'lucide-react';

export interface CarouselSlide {
  id: string;
  type: 'image' | 'content';
  src?: string;
  alt?: string;
  title?: string;
  content?: string;
  link?: string;
}

export interface CarouselBlockProps {
  slides: CarouselSlide[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
  height?: string;
  width?: string;
  borderRadius?: number;
  backgroundColor?: string;
  arrowColor?: string;
  dotColor?: string;
  activeDotColor?: string;
  padding?: number;
  margin?: number;
  slideSpacing?: number;
  animationDuration?: number;
  pauseOnHover?: boolean;
}

export const CarouselBlock: React.FC<CarouselBlockProps> = ({
  slides = [
    { id: '1', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 1', title: 'Slide 1' },
    { id: '2', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 2', title: 'Slide 2' },
    { id: '3', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 3', title: 'Slide 3' }
  ],
  autoplay = false,
  autoplayInterval = 3000,
  showArrows = true,
  showDots = true,
  infinite = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  height = '400px',
  width = '100%',
  borderRadius = 8,
  backgroundColor = '#f8fafc',
  arrowColor = '#ffffff',
  dotColor = '#cbd5e1',
  activeDotColor = '#3b82f6',
  padding = 0,
  margin = 0,
  slideSpacing = 16,
  animationDuration = 300,
  pauseOnHover = true
}) => {
  const { connectors: { connect, drag } } = useNode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;
  const maxSlide = infinite ? totalSlides : totalSlides - slidesToShow;

  useEffect(() => {
    if (autoplay && !isHovered && totalSlides > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          if (infinite) {
            return (prev + slidesToScroll) % totalSlides;
          } else {
            return prev + slidesToScroll >= maxSlide ? 0 : prev + slidesToScroll;
          }
        });
      }, autoplayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, isHovered, autoplayInterval, totalSlides, slidesToScroll, infinite, maxSlide]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) => (prev + slidesToScroll) % totalSlides);
    } else {
      setCurrentSlide((prev) => 
        prev + slidesToScroll >= maxSlide ? maxSlide : prev + slidesToScroll
      );
    }
  };

  const prevSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) => 
        prev - slidesToScroll < 0 ? totalSlides - slidesToScroll : prev - slidesToScroll
      );
    } else {
      setCurrentSlide((prev) => 
        prev - slidesToScroll < 0 ? 0 : prev - slidesToScroll
      );
    }
  };

  const containerStyles = {
    position: 'relative' as const,
    width,
    height,
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    margin: `${margin}px`,
    overflow: 'hidden'
  };

  const slidesContainerStyles = {
    display: 'flex',
    transition: `transform ${animationDuration}ms ease-in-out`,
    transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
    height: '100%'
  };

  const slideStyles = {
    minWidth: `${100 / slidesToShow}%`,
    height: '100%',
    paddingRight: `${slideSpacing}px`,
    boxSizing: 'border-box' as const
  };

  const arrowStyles = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: arrowColor,
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
    transition: 'opacity 0.2s ease'
  };

  const dotsContainerStyles = {
    position: 'absolute' as const,
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 2
  };

  const dotStyles = (isActive: boolean) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: isActive ? activeDotColor : dotColor,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  });

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={containerStyles}
      className="carousel-block"
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <div style={slidesContainerStyles}>
        {slides.map((slide, index) => (
          <div key={slide.id} style={slideStyles}>
            {slide.type === 'image' ? (
              <div className="relative w-full h-full">
                <img
                  src={slide.src}
                  alt={slide.alt || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: `${borderRadius}px` }}
                />
                {slide.title && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
                    <h3 className="font-semibold">{slide.title}</h3>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="w-full h-full flex flex-col justify-center items-center text-center p-6"
                style={{ borderRadius: `${borderRadius}px`, backgroundColor: '#ffffff' }}
              >
                {slide.title && (
                  <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
                )}
                {slide.content && (
                  <div className="text-gray-600 whitespace-pre-wrap">{slide.content}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <button
            style={{ ...arrowStyles, left: '16px' }}
            onClick={prevSlide}
            className="hover:opacity-80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            style={{ ...arrowStyles, right: '16px' }}
            onClick={nextSlide}
            className="hover:opacity-80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div style={dotsContainerStyles}>
          {Array.from({ length: Math.ceil(totalSlides / slidesToShow) }).map((_, index) => (
            <div
              key={index}
              style={dotStyles(Math.floor(currentSlide / slidesToShow) === index)}
              onClick={() => goToSlide(index * slidesToShow)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CarouselBlockSettings: React.FC = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as CarouselBlockProps
  }));

  const addSlide = (type: 'image' | 'content') => {
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      type,
      ...(type === 'image' 
        ? { src: 'https://via.placeholder.com/800x400', alt: `Slide ${props.slides.length + 1}`, title: `Slide ${props.slides.length + 1}` }
        : { title: `Content Slide ${props.slides.length + 1}`, content: 'Add your content here...' }
      )
    };
    setProp((props: CarouselBlockProps) => {
      props.slides.push(newSlide);
    });
  };

  const removeSlide = (slideId: string) => {
    if (props.slides.length > 1) {
      setProp((props: CarouselBlockProps) => {
        props.slides = props.slides.filter(slide => slide.id !== slideId);
      });
    }
  };

  const updateSlide = (slideId: string, field: keyof CarouselSlide, value: string) => {
    setProp((props: CarouselBlockProps) => {
      const slide = props.slides.find(s => s.id === slideId);
      if (slide) {
        (slide as any)[field] = value;
      }
    });
  };

  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    setProp((props: CarouselBlockProps) => {
      const currentIndex = props.slides.findIndex(slide => slide.id === slideId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < props.slides.length) {
        const [movedSlide] = props.slides.splice(currentIndex, 1);
        props.slides.splice(newIndex, 0, movedSlide);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Slides</Label>
        <div className="space-y-2 mt-2">
          {props.slides.map((slide, index) => (
            <div key={slide.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {slide.type === 'image' ? 'Image' : 'Content'} Slide {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveSlide(slide.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveSlide(slide.id, 'down')}
                    disabled={index === props.slides.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSlide(slide.id)}
                    disabled={props.slides.length <= 1}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {slide.type === 'image' ? (
                <>
                  <div>
                    <Label className="text-xs">Image URL</Label>
                    <Input
                      value={slide.src || ''}
                      onChange={(e) => updateSlide(slide.id, 'src', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                      value={slide.alt || ''}
                      onChange={(e) => updateSlide(slide.id, 'alt', e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Title (Optional)</Label>
                    <Input
                      value={slide.title || ''}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      placeholder="Slide title"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={slide.title || ''}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      placeholder="Content slide title"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Content</Label>
                    <Textarea
                      value={slide.content || ''}
                      onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                      placeholder="Slide content"
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label className="text-xs">Link (Optional)</Label>
                <Input
                  value={slide.link || ''}
                  onChange={(e) => updateSlide(slide.id, 'link', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Button onClick={() => addSlide('image')} variant="outline" size="sm" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
            <Button onClick={() => addSlide('content')} variant="outline" size="sm" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.autoplay}
          onCheckedChange={(checked) => setProp((props: CarouselBlockProps) => props.autoplay = checked)}
        />
        <Label className="text-sm">Autoplay</Label>
      </div>

      {props.autoplay && (
        <div>
          <Label className="text-sm font-medium">Autoplay Interval: {props.autoplayInterval}ms</Label>
          <Slider
            value={[props.autoplayInterval || 3000]}
            onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.autoplayInterval = value)}
            min={1000}
            max={10000}
            step={500}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.showArrows}
          onCheckedChange={(checked) => setProp((props: CarouselBlockProps) => props.showArrows = checked)}
        />
        <Label className="text-sm">Show Arrows</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.showDots}
          onCheckedChange={(checked) => setProp((props: CarouselBlockProps) => props.showDots = checked)}
        />
        <Label className="text-sm">Show Dots</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.infinite}
          onCheckedChange={(checked) => setProp((props: CarouselBlockProps) => props.infinite = checked)}
        />
        <Label className="text-sm">Infinite Loop</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.pauseOnHover}
          onCheckedChange={(checked) => setProp((props: CarouselBlockProps) => props.pauseOnHover = checked)}
        />
        <Label className="text-sm">Pause on Hover</Label>
      </div>

      <div>
        <Label className="text-sm font-medium">Slides to Show: {props.slidesToShow}</Label>
        <Slider
          value={[props.slidesToShow || 1]}
          onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.slidesToShow = value)}
          min={1}
          max={5}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Slides to Scroll: {props.slidesToScroll}</Label>
        <Slider
          value={[props.slidesToScroll || 1]}
          onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.slidesToScroll = value)}
          min={1}
          max={3}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Border Radius: {props.borderRadius}px</Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.borderRadius = value)}
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Slide Spacing: {props.slideSpacing}px</Label>
        <Slider
          value={[props.slideSpacing || 0]}
          onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.slideSpacing = value)}
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Animation Duration: {props.animationDuration}ms</Label>
        <Slider
          value={[props.animationDuration || 300]}
          onValueChange={([value]) => setProp((props: CarouselBlockProps) => props.animationDuration = value)}
          min={100}
          max={1000}
          step={50}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Height</Label>
        <Input
          value={props.height}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.height = e.target.value)}
          placeholder="e.g., 400px, 50vh, auto"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Width</Label>
        <Input
          value={props.width}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.width = e.target.value)}
          placeholder="e.g., 100%, 800px, auto"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.backgroundColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Arrow Color</Label>
        <Input
          type="color"
          value={props.arrowColor}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.arrowColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Dot Color</Label>
        <Input
          type="color"
          value={props.dotColor}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.dotColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Active Dot Color</Label>
        <Input
          type="color"
          value={props.activeDotColor}
          onChange={(e) => setProp((props: CarouselBlockProps) => props.activeDotColor = e.target.value)}
        />
      </div>
    </div>
  );
};

(CarouselBlock as any).craft = {
  props: {
    slides: [
      { id: '1', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 1', title: 'Slide 1' },
      { id: '2', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 2', title: 'Slide 2' },
      { id: '3', type: 'image', src: 'https://via.placeholder.com/800x400', alt: 'Slide 3', title: 'Slide 3' }
    ],
    autoplay: false,
    autoplayInterval: 3000,
    showArrows: true,
    showDots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    height: '400px',
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    arrowColor: '#ffffff',
    dotColor: '#cbd5e1',
    activeDotColor: '#3b82f6',
    padding: 0,
    margin: 0,
    slideSpacing: 16,
    animationDuration: 300,
    pauseOnHover: true
  },
  related: {
    settings: CarouselBlockSettings
  }
};