import React from 'react'
import Lottie from 'lottie-react'
import loadingAnimation from '../../../public/loading.json'

export const LoadingSpinner = ({ show = true, className = '' }) =>
  show && <Lottie animationData={loadingAnimation} className={className} loop={true} />
