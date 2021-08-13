import _get from 'lodash.get';

import {
  ajaxLoginRequest,
  generateCustomerToken,
  fetchCustomerInfoRequest,
  updateCustomerAddressRequest,
  fetchCustomerAddressListRequest,
} from '../../../api';
import {
  setErrorMessageAction,
  setSuccessMessageAction,
} from '../page/actions';
import {
  SET_CUSTOMER_INFO,
  UPDATE_CUSTOMER_ADDRESS,
  SET_CUSTOMER_ADDRESS_INFO,
  UPDATE_CUSTOMER_LOGGEDIN_STATUS,
} from './types';
import { config } from '../../../config';
import { _cleanObjByKeys } from '../../../utils';
import LocalStorage from '../../../utils/localStorage';

export function setLoggedInStatusAction(dispatch, status) {
  dispatch({
    type: UPDATE_CUSTOMER_LOGGEDIN_STATUS,
    payload: status,
  });
}

export async function sigInCustomerAction(dispatch, userCredentials) {
  try {
    const { token } = await generateCustomerToken(dispatch, userCredentials);
    LocalStorage.saveCustomerToken(token);
    setLoggedInStatusAction(dispatch, true);
    setSuccessMessageAction(dispatch, 'You are successfully logged-in');

    return true;
  } catch (error) {
    console.error(error);
    setErrorMessageAction(
      dispatch,
      _get(error, 'message') ||
        'Something went wrong with sign-in. Please try later'
    );
  }

  return false;
}

export async function ajaxLoginAction(dispatch, userCredentials) {
  try {
    const response = await ajaxLoginRequest(dispatch, userCredentials);
    const { errors, data } = response;

    if (config.isProductionMode && typeof window !== 'undefined') {
      window.location.reload();
    }

    if (!errors) {
      const signInToken = _get(data, 'customer.signin_token');
      const cartId = _get(data, 'cart.cartId');
      LocalStorage.saveCartId(cartId);
      LocalStorage.saveCustomerToken(signInToken);
    }

    return response;
  } catch (error) {
    console.error(error);
  }

  return {};
}

export async function getCustomerInfoAction(dispatch) {
  try {
    const customerInfo = await fetchCustomerInfoRequest(dispatch);

    dispatch({
      type: SET_CUSTOMER_INFO,
      payload: customerInfo,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getCustomerAddressListAction(dispatch) {
  try {
    const customerAddressInfo = await fetchCustomerAddressListRequest(dispatch);

    dispatch({
      type: SET_CUSTOMER_ADDRESS_INFO,
      payload: customerAddressInfo,
    });

    return customerAddressInfo;
  } catch (error) {
    console.error(error);
  }

  return {};
}

export async function updateCustomerAddressAction(
  dispatch,
  addressId,
  customerAddress,
  stateInfo
) {
  try {
    const address = { ...customerAddress };
    const { country, phone, region, zipcode } = customerAddress;

    if (country) {
      address.country_code = country;
    }
    if (phone) {
      address.telephone = phone;
    }
    if (region) {
      address.region = {
        region_code: region,
        region: _get(stateInfo, 'code'),
        region_id: _get(stateInfo, 'id'),
      };
    }
    if (zipcode) {
      address.postcode = zipcode;
    }
    const keysToRemove = [
      'id',
      'phone',
      'country',
      'zipcode',
      'fullName',
      'regionCode',
      'countryCode',
      'regionLabel',
      'selectedAddress',
      'isSameAsShipping',
      'isDefaultBilling',
      'isDefaultShipping',
    ];

    const customerAddressInfo = await updateCustomerAddressRequest(
      dispatch,
      addressId,
      _cleanObjByKeys(address, keysToRemove)
    );

    dispatch({
      type: UPDATE_CUSTOMER_ADDRESS,
      payload: customerAddressInfo,
    });
  } catch (error) {
    console.error(error);
  }
}