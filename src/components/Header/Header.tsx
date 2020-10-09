import React, { useCallback, useState } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import avatar from 'images/avatar.png';
import ChangeName from './ChangeName';
import Modal from 'components/Modal/Modal';
import { Link } from './Link';

import { HEADER_ITEMS } from 'constants/header';
import { LINKS_CONFIG } from 'src/config';

import { QRCode } from 'components/QRCode/QRCode';
import { useTimeout } from 'hooks/timers';
import { ConnectionStatus } from 'components/Header/ConnectionStatus';
import { useLogout } from 'hooks/useLogout';
import './Header.scss';
import { useStore } from 'src/store/context';
import { observer } from 'mobx-react-lite';
import { addressMiddleCutter } from 'src/utils';

library.add(fas);

const Header: React.FC = observer(() => {
  const store = useStore();

  const address = store.zkWalletAddress;
  const userName = window.localStorage?.getItem(store.zkWallet ? address! : '');

  const [isCopyModal, openCopyModal] = useState<boolean>(false);
  const [isChangeNameOpen, openChangeName] = useState<boolean>(false);

  const inputRef: (HTMLInputElement | null)[] = [];

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const input: any = document.getElementsByClassName(
          'copy-block-input',
        )[0];
        const range = document.createRange();
        range.selectNodeContents(input);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        input.setSelectionRange(0, 999999);
        document.execCommand('copy');
      } else {
        openCopyModal(true);
        inputRef.map(el => {
          if (address === el?.value) {
            el?.focus();
            el?.select();
            document.execCommand('copy');
          }
        });
      }
    },
    [inputRef, address],
  );

  const logout = useLogout();

  useTimeout(() => isCopyModal && openCopyModal(false), 2000, [isCopyModal]);

  return (
    <div className='menu-wrapper'>
      <div className='menu-top'>
        <div className='beta-container'>
          <Link
            onClick={() => (!store.zkWallet ? logout(false, '') : undefined)}
            className='menu-logo'
            to='/'
          ></Link>
          <p className='beta-text'>{'BETA'}</p>
        </div>

        {address && (
          <div className='menu-right'>
            <div>
              <Link
                target='_blank'
                className={'menu-right-route'}
                to={`//${LINKS_CONFIG.zkSyncBlockExplorer}`}
              >
                {'Block explorer'}
                <span className='icon-explorer-link'>
                  <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
                </span>
              </Link>
              <Link
                target='_blank'
                className={'menu-right-route'}
                to={'//zksync.io/faq/intro.html'}
              >
                {'Docs'}
                <span className='icon-explorer-link'>
                  <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
                </span>
              </Link>
            </div>

            <button
              type='button'
              className='menu-wallet btn-tr'
              onClick={() => {
                store.modalSpecifier = 'wallet';
              }}
            >
              <p>{userName || addressMiddleCutter(address, 11, 4)}</p>
              <img
                src={store.zkWallet ? makeBlockie(address) : avatar}
                alt='avatar'
              />
              <div className='arrow-select'></div>
            </button>
            <Modal visible={false} background={true} classSpecifier='wallet'>
              <div className='wallet-title'>
                <img
                  src={store.zkWallet ? makeBlockie(address) : avatar}
                  alt='avatar'
                />{' '}
                <p>{userName || addressMiddleCutter(address, 8, 4)}</p>
              </div>
              <div onClick={handleCopy} className='copy-block'>
                <input
                  readOnly
                  className='copy-block-input'
                  value={address.toString()}
                  ref={e => inputRef.push(e)}
                />
                <p>{address}</p>
                <button
                  className={`copy-block-button btn-tr ${
                    isCopyModal ? 'copied' : ''
                  }`}
                  onClick={handleCopy}
                />
              </div>
              <QRCode data={address} />
              <div className='horizontal-line' />
              <div className='wallet-buttons'>
                <button
                  className='btn-tr'
                  onClick={() => {
                    store.modalSpecifier = 'qr';
                  }}
                >
                  <span className='icon-qr'></span>
                  {'Show QR code'}
                </button>
                <div className='horizontal-line'></div>
                <a
                  className='btn-tr mob'
                  target='_blank'
                  href={'//zksync.io/faq/intro.html'}
                >
                  <span className='icon-explorer'>
                    <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
                  </span>
                  {'Docs'}
                </a>
                <a
                  className='btn-tr'
                  target='_blank'
                  href={`//${LINKS_CONFIG.zkSyncBlockExplorer}/accounts/${address}`}
                >
                  <span className='icon-explorer'>
                    <FontAwesomeIcon icon={['fas', 'external-link-alt']} />
                  </span>
                  {'View in block explorer'}
                </a>
                <button className='btn-tr' onClick={() => openChangeName(true)}>
                  <span className='icon-edit'></span>
                  {'Rename wallet'}
                </button>
                <div className='horizontal-line'></div>
                <button
                  className='btn-tr'
                  onClick={() => {
                    store.isAccessModalOpen = false;
                    logout(false, '');
                  }}
                >
                  <span className='icon-disconnect'></span>
                  {'Disconnect wallet'}
                </button>
                <div className='horizontal-line' />
              </div>
            </Modal>
            <Modal visible={false} background={true} classSpecifier='qr'>
              <QRCode data={address} />
            </Modal>
            <Modal
              visible={isChangeNameOpen}
              cancelAction={() => openChangeName(false)}
              background={true}
              classSpecifier='change-name'
              centered
            >
              <ChangeName setModalOpen={openChangeName} />
            </Modal>
          </div>
        )}
      </div>
      <div className='menu-routes'>
        {address &&
          !store.isExternalWallet &&
          HEADER_ITEMS.map(({ title, link }) => (
            <div className='menu-route-wrapper' key={title}>
              <Link
                className={`menu-route ${
                  link === window?.location.pathname ? 'active' : ''
                }`}
                to={link}
              >
                {title}
              </Link>
            </div>
          ))}
      </div>
      <ConnectionStatus />
    </div>
  );
});

export default Header;
