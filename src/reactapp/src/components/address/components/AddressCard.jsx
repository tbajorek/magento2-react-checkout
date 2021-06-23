/* eslint-disable react/no-array-index-key */
import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';

import Button from '../../common/Button';
import Card from '../../common/Card';
import RadioInput from '../../common/Form/RadioInput';
import { __ } from '../../../i18n';

function AddressCard({
  address: { id, address },
  isSelected,
  inputName,
  actions,
}) {
  return (
    <Card bg="dark" classes="card-interactive">
      <ul>
        <li className="flex items-end justify-end">
          <RadioInput
            name={inputName}
            checked={isSelected}
            value={id}
            style={isSelected ? {} : { borderColor: '#aaa' }}
            onChange={() => actions.performAddressSwitching(id)}
          />
        </li>

        {address.map((addrAttr, index) => (
          <li key={`${id}_${addrAttr}_${index}`} className="text-sm italic">
            {addrAttr}
          </li>
        ))}

        {isSelected && (
          <li>
            <div className="flex items-center justify-center mt-2">
              <Button click={actions.performAddressEdit} variant="secondary">
                {__('Edit')}
              </Button>
            </div>
          </li>
        )}
      </ul>
    </Card>
  );
}

AddressCard.propTypes = {
  isSelected: bool,
  inputName: string.isRequired,
  address: shape({ id: string, address: arrayOf(string) }).isRequired,
  actions: shape({ performAddressSwitching: func, performAddressEdit: func })
    .isRequired,
};

AddressCard.defaultProps = {
  isSelected: false,
};

export default AddressCard;
