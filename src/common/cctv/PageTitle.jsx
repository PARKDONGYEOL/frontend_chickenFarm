import React from 'react';

const PageTitle = ({title='페이지 제목', size='200px', color='black', fontStyle='italic', fontSize='1.2rem'}) => {
  return (
    <p style={{
        'fontSize': fontSize,
        'fontWeight': 'bold',
        'fontStyle': fontStyle,
        'borderBottom': '1.5px solid #dddddd',
        'paddingBottom': '2px',
        'marginBottom': '16px',
        'width': size,
        'color': color
    }} >
      {title}
    </p>
  )
}



export default PageTitle