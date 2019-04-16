import React, { useEffect, useState, useContext } from 'react';
import parser, { XMLElement } from './parser/xml-parser';
import processor from './processor';
import _isEmpty from 'lodash/isEmpty';
import _isUndefined from 'lodash/isUndefined';
import './types/__all__';

interface DefineType {
  [name: string]: React.ComponentType;
}

interface GlobalType {
  [name: string]: number | string | null;
}

interface DataType {
  [name: string]: number | string | null;
}

export interface XMLBuilderContext {
  defines: DefineType;
  global: GlobalType;
  data: DataType;
}

const XMLBuilder = (props) => {
  const { xml = '' } = props;
  const [layout, setLayout] = useState({});
  const contextValue: XMLBuilderContext = {
    defines: {},
    global: {},
    data: {},
  };
  const context = React.createContext(contextValue);

  useEffect(
    () => {
      const data = parser(xml);
      data.type = 'root';
      console.log('data', data);
      setLayout(data);
    },
    [xml]
  );

  if (_isEmpty(layout) || _isUndefined(context)) {
    return null;
  }

  const Provider = context.Provider;
  return (
    <div>
      xmlbuilder:
      <Provider value={contextValue}>
        {processor.render(layout, context)}
      </Provider>
    </div>
  );
};

export default XMLBuilder;