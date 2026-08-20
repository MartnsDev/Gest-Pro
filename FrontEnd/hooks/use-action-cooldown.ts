"use client";

import { useCallback, useEffect, useState } from "react";

export function useActionCooldown(key:string,durationSeconds:number){
  const storageKey=`gevyro:cooldown:${key}`;
  const [remaining,setRemaining]=useState(0);

  const readRemaining=useCallback(()=>{
    if(typeof window==="undefined")return 0;
    const until=Number(window.localStorage.getItem(storageKey)||0);
    return Math.max(0,Math.ceil((until-Date.now())/1000));
  },[storageKey]);

  useEffect(()=>{
    const update=()=>setRemaining(readRemaining());
    update();
    const timer=window.setInterval(update,250);
    return()=>window.clearInterval(timer);
  },[readRemaining]);

  const tryStart=useCallback(()=>{
    if(typeof window==="undefined"||readRemaining()>0){setRemaining(readRemaining());return false;}
    const until=Date.now()+durationSeconds*1000;
    window.localStorage.setItem(storageKey,String(until));
    setRemaining(durationSeconds);
    return true;
  },[durationSeconds,readRemaining,storageKey]);

  return{remaining,blocked:remaining>0,tryStart};
}
