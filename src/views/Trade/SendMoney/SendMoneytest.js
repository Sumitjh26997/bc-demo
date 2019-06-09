import React from 'react';
import SendMoney from './SendMoney';
import { mount } from 'enzyme'

it('renders without crashing', () => {
  mount(<SendMoney />);
});
