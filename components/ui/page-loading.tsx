import React from 'react'
export default function PageLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center">
      <div className="">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      <p className='text-gray-900 mt-2'>Loading...</p>
      </div>
    </div>
  )
}
