export interface HashItem {
    html_url: string;
    commit: {
        url: string;
        message: string;
    };
    committer: {
        login: string;
        id: bigint;
        avatar_url: string;
        html_url: string;
    };
    repository: {
        id: bigint;
        node_id: string;
        name: string;
        full_name: string;
        private: boolean;
        owner: {
            login: string;
            id: bigint;
            node_id: string;
            avatar_url: string;
            gravatar_url: string;
            url: string;
            html_url: string;
            followers_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
        };
        html_url: string;
    };
}

export interface HashDetails {
    items: Array<HashItem>;
}