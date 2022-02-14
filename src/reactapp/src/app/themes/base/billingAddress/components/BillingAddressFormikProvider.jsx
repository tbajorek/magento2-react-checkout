import React, { useCallback, useEffect, useState } from 'react';
import _get from 'lodash.get';
import { Form } from 'formik';
import { node } from 'prop-types';
import { string as YupString, bool as YupBool, array as YupArray } from 'yup';

import {
  isCartAddressValid,
  isValidCustomerAddressId,
} from '../../../../../utils/address';
import {
  useFormSection,
  useFormEditMode,
  useEnterActionInForm,
} from '../../../../../hooks';
import {
  useRegionData,
  useRegionValidation,
} from '../../../../code/address/hooks';
import {
  useBillingAddressAppContext,
  useBillingAddressCartContext,
} from '../../../../code/billingAddress/hooks';
import { __ } from '../../../../../i18n';
import { useSaveAddressAction } from '../hooks';
import { useAddressWrapper } from '../../address/hooks';
import { BILLING_ADDR_FORM } from '../../../../../config';
import { billingAddressFormInitValues } from '../utility';
import LocalStorage from '../../../../../utils/localStorage';
import { formikDataShape } from '../../../../../utils/propTypes';
import { customerHasAddress } from '../../../../../utils/customer';
import { BillingAddressFormikContext } from '../../../../code/billingAddress/context';

const requiredMessage = __('%1 is required');

const initValidationSchema = {
  company: YupString().required(requiredMessage),
  firstname: YupString().required(requiredMessage),
  lastname: YupString().required(requiredMessage),
  street: YupArray().test(
    'street1Required',
    requiredMessage,
    (value) => !!_get(value, 0)
  ),
  phone: YupString().required(requiredMessage),
  zipcode: YupString().required(requiredMessage),
  city: YupString().required(requiredMessage),
  region: YupString().nullable(),
  country: YupString().required(requiredMessage),
  isSameAsShipping: YupBool(),
  saveInBook: YupBool(),
};

function BillingAddressFormikProvider({ children, formikData }) {
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [backupAddress, setBackupAddress] = useState(null);
  const [forceFilledAddress, setForceFilledAddress] = useState(false);
  const { customerAddressList } = useBillingAddressAppContext();
  const { cartBillingAddress } = useBillingAddressCartContext();

  const editModeContext = useFormEditMode();
  const { billingValues, setFieldValue, selectedRegion, selectedCountry } =
    formikData;
  const validationSchema = useRegionValidation(
    selectedCountry,
    initValidationSchema
  );
  const {
    billingSelected: selectedAddress,
    setBillingSelected: setSelectedAddress,
    isBillingCustomerAddress: customerAddressSelected,
    setIsBillingCustomerAddress: setCustomerAddressSelected,
  } = useAddressWrapper();
  const isSame = _get(billingValues, 'isSameAsShipping');
  const { setFormToViewMode } = editModeContext;
  const regionData = useRegionData(selectedCountry, selectedRegion);
  const cartHasBillingAddress = isCartAddressValid(cartBillingAddress);

  const resetBillingAddressFormFields = useCallback(() => {
    setFieldValue(BILLING_ADDR_FORM, {
      ...billingAddressFormInitValues,
      isSameAsShipping: LocalStorage.getBillingSameAsShippingInfo(),
    });
  }, [setFieldValue]);

  const setBillingAddressFormFields = useCallback(
    (addressToSet) => {
      setFieldValue(BILLING_ADDR_FORM, {
        ...billingAddressFormInitValues,
        ...addressToSet,
        isSameAsShipping: LocalStorage.getBillingSameAsShippingInfo(),
      });
    },
    [setFieldValue]
  );

  useEffect(() => {
    if (
      !isNewAddress &&
      (forceFilledAddress === selectedAddress || !cartHasBillingAddress)
    ) {
      if (customerHasAddress(customerAddressList)) {
        setFormToViewMode();
      }
      return;
    }

    // Toggle to view mode if there are customer address or cart address
    // This action should happen only once when the page loads.
    if (
      !isSame &&
      !forceFilledAddress &&
      (cartHasBillingAddress || customerHasAddress(customerAddressList))
    ) {
      setFormToViewMode();
    }

    // This should be happened only once when page loads
    if (!forceFilledAddress && isValidCustomerAddressId(selectedAddress)) {
      setIsNewAddress(false);
    }

    if (cartHasBillingAddress) {
      setForceFilledAddress(selectedAddress);
    }
  }, [
    isSame,
    isNewAddress,
    selectedAddress,
    setFormToViewMode,
    forceFilledAddress,
    customerAddressList,
    cartHasBillingAddress,
  ]);

  let context = {
    ...regionData,
    ...formikData,
    ...editModeContext,
    formikData,
    isNewAddress,
    backupAddress,
    setIsNewAddress,
    selectedAddress,
    setBackupAddress,
    setSelectedAddress,
    customerAddressSelected,
    setCustomerAddressSelected,
    setBillingAddressFormFields,
    resetBillingAddressFormFields,
  };

  const formSubmit = useSaveAddressAction(context);
  const handleKeyDown = useEnterActionInForm({
    formikData,
    validationSchema,
    submitHandler: formSubmit,
  });
  const formContext = useFormSection({
    formikData,
    validationSchema,
    id: BILLING_ADDR_FORM,
    submitHandler: formSubmit,
    initialValues: billingAddressFormInitValues,
  });

  context = { ...context, ...formContext, handleKeyDown };

  return (
    <BillingAddressFormikContext.Provider value={context}>
      <Form id={BILLING_ADDR_FORM}>{children}</Form>
    </BillingAddressFormikContext.Provider>
  );
}

BillingAddressFormikProvider.propTypes = {
  children: node.isRequired,
  formikData: formikDataShape.isRequired,
};

export default BillingAddressFormikProvider;