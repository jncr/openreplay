import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { NoContent, Loader, Pagination } from 'UI';
import { List } from 'immutable';
import SessionItem from 'Shared/SessionItem';
import withPermissions from 'HOCs/withPermissions';
import { KEYS } from 'Types/filter/customFilter';
import { applyFilter } from 'Duck/liveSearch';
import { FilterKey } from 'App/types/filter/filterType';
import { addFilterByKeyAndValue, updateCurrentPage } from 'Duck/liveSearch';
import Select from 'Shared/Select';
import SortOrderButton from 'Shared/SortOrderButton';
import { capitalize } from 'App/utils';
import LiveSessionReloadButton from 'Shared/LiveSessionReloadButton';
import cn from 'classnames';

const AUTOREFRESH_INTERVAL = 0.5 * 60 * 1000;
const PER_PAGE = 10;

interface Props {
    loading: boolean;
    metaListLoading: boolean;
    list: List<any>;
    // fetchLiveList: () => Promise<void>,
    applyFilter: (filter: any) => void;
    filter: any;
    // addAttribute: (obj: any) => void,
    addFilterByKeyAndValue: (key: FilterKey, value: string) => void;
    updateCurrentPage: (page: number) => void;
    currentPage: number;
    totla: number;
    metaList: any;
    sort: any;
    total: number;
}

function LiveSessionList(props: Props) {
    const { loading, metaListLoading, filter, list, currentPage, total, metaList = [], sort } = props;
    var timeoutId: any;
    const { filters } = filter;
    const hasUserFilter = filters.map((i: any) => i.key).includes(KEYS.USERID);
    const sortOptions = [{ label: 'Newest', value: 'timestamp' }].concat(
        metaList
            .map((i: any) => ({
                label: capitalize(i),
                value: i,
            }))
            .toJS()
    );

    useEffect(() => {
        if (metaListLoading) return;
        const _filter = { ...filter };
        if (sortOptions[1] && !filter.sort) {
            _filter.sort = sortOptions[1].value;
        }
        props.applyFilter(_filter);
        timeout();
        return () => {
            clearTimeout(timeoutId);
        };
    }, [metaListLoading]);

    const onUserClick = (userId: string, userAnonymousId: string) => {
        if (userId) {
            props.addFilterByKeyAndValue(FilterKey.USERID, userId);
        } else {
            props.addFilterByKeyAndValue(FilterKey.USERANONYMOUSID, userAnonymousId);
        }
    };

    const onSortChange = ({ value }: any) => {
        props.applyFilter({ sort: value.value });
    };

    const timeout = () => {
        timeoutId = setTimeout(() => {
            props.applyFilter({ ...filter });
            timeout();
        }, AUTOREFRESH_INTERVAL);
    };

    return (
        <div>
            <div className="flex mb-6 justify-between items-end">
                <div className="flex items-baseline">
                    <h3 className="text-2xl capitalize">
                        <span>Live Sessions</span>
                        <span className="ml-2 font-normal color-gray-medium">{total}</span>
                    </h3>

                    <LiveSessionReloadButton onClick={() => props.applyFilter({ ...filter })} />
                </div>
                <div className="flex items-center">
                    <div className="flex items-center ml-6 mr-4">
                        <span className="mr-2 color-gray-medium">Sort By</span>
                        <div className={cn('flex items-center', { disabled: sortOptions.length === 0 })}>
                            <Select
                                plain
                                right
                                options={sortOptions}
                                onChange={onSortChange}
                                value={sortOptions.find((i: any) => i.value === filter.sort) || sortOptions[0]}
                            />
                            <div className="mx-2" />
                            <SortOrderButton onChange={(state: any) => props.applyFilter({ order: state })} sortOrder={filter.order} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-3 rounded border">
                <Loader loading={loading}>
                    <NoContent
                        title={'No live sessions.'}
                        subtext={
                            <span>
                                See how to setup the{' '}
                                <a target="_blank" className="link" href="https://docs.openreplay.com/plugins/assist">
                                    {'Assist'}
                                </a>{' '}
                                plugin, if you haven’t done that already.
                            </span>
                        }
                        image={<img src="/assets/img/live-sessions.png" style={{ width: '70%', marginBottom: '30px' }} />}
                        show={!loading && list.size === 0}
                    >
                        <div>
                            {list.map((session) => (
                                <>
                                    <SessionItem
                                        key={session.sessionId}
                                        session={session}
                                        live
                                        hasUserFilter={hasUserFilter}
                                        onUserClick={onUserClick}
                                        metaList={metaList}
                                    />
                                    <div className="border-b" />
                                </>
                            ))}
                        </div>
                    </NoContent>
                </Loader>

                <div className={cn('w-full flex items-center justify-center py-6', { disabled: loading })}>
                    <Pagination
                        page={currentPage}
                        totalPages={Math.ceil(total / PER_PAGE)}
                        onPageChange={(page: any) => props.updateCurrentPage(page)}
                        limit={PER_PAGE}
                        debounceRequest={500}
                    />
                </div>
            </div>
        </div>
    );
}

export default withPermissions(['ASSIST_LIVE'])(
    connect(
        (state: any) => ({
            list: state.getIn(['liveSearch', 'list']),
            loading: state.getIn(['liveSearch', 'fetchList', 'loading']),
            metaListLoading: state.getIn(['customFields', 'fetchRequest', 'loading']),
            filter: state.getIn(['liveSearch', 'instance']),
            total: state.getIn(['liveSearch', 'total']),
            currentPage: state.getIn(['liveSearch', 'currentPage']),
            metaList: state.getIn(['customFields', 'list']).map((i: any) => i.key),
            sort: state.getIn(['liveSearch', 'sort']),
        }),
        {
            applyFilter,
            addFilterByKeyAndValue,
            updateCurrentPage,
        }
    )(LiveSessionList)
);
