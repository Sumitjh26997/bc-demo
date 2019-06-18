import React from 'react';
import ReactDOM from 'react-dom';
import ViewTransactions from './ViewTransactions';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ViewTransactions />, div);
  ReactDOM.unmountComponentAtNode(div);
});
