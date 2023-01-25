import React from 'react'
import Tilt from 'react-parallax-tilt'
import brain from './brain.png'
import './Logo.css'


const Logo = () => {
    return (
        <div className='ma4 mto'>
            <Tilt className='Tilt br2 shadow-2' options={{max:55}} style={{height:250, width:250}}>
            <div className='Tilt-inner pa3'><img style={{paddingTop: '5px', height:150, width: 150}} alt='logo' src={brain}/></div>
            </Tilt>
        </div>
    )
}

export default Logo
