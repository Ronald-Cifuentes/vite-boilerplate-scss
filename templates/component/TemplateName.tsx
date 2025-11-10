import './TemplateName.module.scss'

import { FC } from 'react'
import { TemplateNameProps } from './interfaces'

const TemplateName: FC<TemplateNameProps> = ({ dataTestId = 'template-name' }) => {
  return (
    <div className='templateName' data-testid={dataTestId}>
      <h1>TemplateName component</h1>
    </div>
  )
}

export default TemplateName
