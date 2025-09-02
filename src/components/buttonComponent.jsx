export function ButtonComponent({type,className,children}){
    return <button type={type?type:'button'} className={className?className:'rounded-lg border border-[#FF4B2B] bg-[#FF4B2B] text-white text-xs font-bold py-[12px] px-[45px] tracking-[1px] uppercase transition-transform duration-[80ms] ease-in active:scale-95 focus:outline-none '}>
              {children}
            </button>
}