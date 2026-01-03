import React from 'react'

export default function Footer(){
  return (
    <footer className="footer mt-5">
      <div className="container d-flex justify-content-between align-items-center">
        <div>© Vianelo · Antojos y buenos momentos</div>
        <div>
          <a className="text-white me-3" target="_blank" href="https://www.instagram.com/vianeloreposteriamx?igsh=bTlrcmg5YzJuZndp"><i className="bi bi-instagram fs-3"></i></a>
          <a className="text-white me-3" target="_blank" href="https://www.facebook.com/share/19vYwhxaL2/"><i className="bi bi-facebook fs-3"></i></a>
          <a className="text-white" target="_blank" href="https://www.tiktok.com/@vianeloreposteria?_r=1&_t=ZS-917sMwoJJCB"><i className='bi bi-tiktok fs-3'></i></a>
        </div>
      </div>
    </footer>
  )
}
